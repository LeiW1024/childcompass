#!/usr/bin/env node
// .claude/skills/update-activities/scripts/update-activities.mjs
// Fetch fresh childcare/activity data for Erfurt, upsert to DB, geocode locations.
// Usage:
//   node --env-file=.env.local .claude/skills/update-activities/scripts/update-activities.mjs SPORTS

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORY_PROMPTS = {
  DAYCARE:    "Kindertagesstätten, Krippen, Tagesmütter",
  PLAYGROUP:  "Spielgruppen, Krabbelgruppen, Eltern-Kind-Gruppen",
  SPORTS:     "Kindersport, Turnen, Fußball für Kinder",
  ARTS_CRAFTS:"Kreativkurse, Basteln, Malen für Kinder",
  MUSIC:      "Musikschule, Musikgruppen für Kleinkinder, Rhythmik",
  LANGUAGE:   "Sprachkurse für Kinder, Englisch für Kinder",
  SWIMMING:   "Schwimmkurse für Kinder, Baby-Schwimmen",
  NATURE:     "Naturkindergarten, Waldgruppe, Natur-Erlebnisse für Kinder",
  EDUCATION:  "Lernförderung, Vorschule, Nachhilfe für Kinder",
};

const ALL_CATEGORIES = Object.keys(CATEGORY_PROMPTS);

// ─── Env checks ────────────────────────────────────────────────────────────

function checkEnv() {
  const missing = [];
  if (!process.env.ANTHROPIC_API_KEY) missing.push("ANTHROPIC_API_KEY");
  if (!process.env.DATABASE_URL)       missing.push("DATABASE_URL");
  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) missing.push("NEXT_PUBLIC_MAPBOX_TOKEN");
  if (missing.length) {
    console.error(`❌ Missing environment variables: ${missing.join(", ")}`);
    console.error("   Make sure .env.local is complete and run with --env-file=.env.local");
    process.exit(1);
  }
}

// ─── Claude web search ─────────────────────────────────────────────────────

async function fetchProvidersFromClaude(category) {
  const categoryDE = CATEGORY_PROMPTS[category];
  const prompt = `You are a research assistant helping build a childcare marketplace for Erfurt, Germany.

Search the web for real childcare providers and activities in Erfurt that match this category: "${categoryDE}" (${category}).
Target age group: 0–6 years old (0–72 months).

Find at least 5 real providers/activities. For each one, extract:
- businessName: the real name of the provider/organization
- description: 2-3 sentences about what they offer (in English)
- descriptionDe: the same description translated to German
- address: street address in Erfurt if available
- city: "Erfurt"
- phone: phone number if available
- website: website URL if available
- category: "${category}"
- ageMinMonths: minimum age in months (e.g. 0 for babies, 24 for 2 years)
- ageMaxMonths: maximum age in months (e.g. 72 for 6 years, max 72)
- price: estimated price as a number (use 0 if unknown/free)
- pricePer: one of [SESSION, MONTH, WEEK, YEAR]
- scheduleNotes: any schedule info, or null if unknown
- sourceUrl: the URL where you found this information

Return ONLY a valid JSON array. No markdown, no explanation, just the raw JSON array.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error (${response.status}): ${err.slice(0, 200)}`);
  }

  const data = await response.json();
  const fullText = data.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  const jsonMatch = fullText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error(`No JSON array in Claude response:\n${fullText.slice(0, 300)}`);

  return JSON.parse(jsonMatch[0]);
}

// ─── Geocoding via Mapbox ──────────────────────────────────────────────────

async function geocode(address, city = "Erfurt") {
  const query = encodeURIComponent(`${address}, ${city}, Germany`);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${token}&limit=1&country=de`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  const feature = data.features?.[0];
  if (!feature) return null;

  const [longitude, latitude] = feature.center;
  return { latitude, longitude };
}

// ─── Upsert logic ─────────────────────────────────────────────────────────

async function upsertProvider(raw) {
  // Check for duplicate by businessName (case-insensitive)
  const existing = await prisma.providerProfile.findFirst({
    where: { businessName: { equals: raw.businessName, mode: "insensitive" } },
  });

  if (existing) return { provider: existing, isNew: false };

  const provider = await prisma.providerProfile.create({
    data: {
      businessName: raw.businessName,
      description:  raw.description  || null,
      address:      raw.address      || null,
      city:         raw.city         || "Erfurt",
      phone:        raw.phone        || null,
      website:      raw.website      || null,
      sourceUrl:    raw.sourceUrl    || null,
      isClaimed:    false,
      isVerified:   false,
    },
  });

  return { provider, isNew: true };
}

async function upsertListing(provider, raw) {
  // Check for duplicate by title + providerProfileId
  const existing = await prisma.listing.findFirst({
    where: {
      providerProfileId: provider.id,
      title: { equals: raw.businessName, mode: "insensitive" },
    },
  });

  if (existing) return { listing: existing, isNew: false };

  // Geocode if provider has an address
  let coords = null;
  if (raw.address) {
    coords = await geocode(raw.address, raw.city || "Erfurt");
  }

  const listing = await prisma.listing.create({
    data: {
      providerProfileId: provider.id,
      title:         raw.businessName,
      description:   raw.description || "More information coming soon.",
      descriptionDe: raw.descriptionDe || "Weitere Informationen folgen.",
      category:      raw.category,
      ageMinMonths:  Number(raw.ageMinMonths ?? 0),
      ageMaxMonths:  Math.min(Number(raw.ageMaxMonths ?? 72), 72),
      price:         Number(raw.price ?? 0),
      pricePer:      raw.pricePer || "MONTH",
      address:       raw.address   || null,
      city:          raw.city      || "Erfurt",
      scheduleNotes: raw.scheduleNotes || null,
      isPublished:   true,
      isAdminSeeded: true,
      latitude:      coords?.latitude  ?? null,
      longitude:     coords?.longitude ?? null,
    },
  });

  return { listing, isNew: true, geocoded: !!coords };
}

// ─── Process one category ──────────────────────────────────────────────────

async function processCategory(category) {
  console.log(`\n🔍 Searching: ${category} (${CATEGORY_PROMPTS[category]})`);

  let rawProviders;
  try {
    rawProviders = await fetchProvidersFromClaude(category);
    console.log(`   Claude returned ${rawProviders.length} results`);
  } catch (err) {
    console.error(`   ❌ Failed to fetch: ${err.message}`);
    return { category, providers: 0, listings: 0, geocoded: 0, skipped: 0, error: err.message };
  }

  let providersAdded = 0, listingsAdded = 0, geocodedCount = 0, skippedCount = 0;

  for (const raw of rawProviders) {
    try {
      const { provider, isNew: providerIsNew } = await upsertProvider(raw);
      if (providerIsNew) providersAdded++;

      const { isNew: listingIsNew, geocoded } = await upsertListing(provider, raw);
      if (listingIsNew) {
        listingsAdded++;
        if (geocoded) geocodedCount++;
      } else {
        skippedCount++;
      }
    } catch (err) {
      console.error(`   ⚠ Skipping "${raw.businessName}": ${err.message}`);
      skippedCount++;
    }
  }

  console.log(`   ✅ +${providersAdded} providers, +${listingsAdded} listings, ${geocodedCount} geocoded, ${skippedCount} skipped`);
  return { category, providers: providersAdded, listings: listingsAdded, geocoded: geocodedCount, skipped: skippedCount };
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  checkEnv();

  const arg = process.argv[2]?.toUpperCase();

  if (!arg) {
    console.error("❌ Category argument required.");
    console.error(`   Usage: node --env-file=.env.local .claude/skills/update-activities/scripts/update-activities.mjs <CATEGORY>`);
    console.error(`   Valid categories: ${ALL_CATEGORIES.join(", ")}`);
    process.exit(1);
  }

  if (!ALL_CATEGORIES.includes(arg)) {
    console.error(`❌ Unknown category: "${arg}"`);
    console.error(`   Valid categories: ${ALL_CATEGORIES.join(", ")}`);
    process.exit(1);
  }

  console.log(`\n🧭 ChildCompass — Update Activities`);
  console.log(`   Category: ${arg}`);
  console.log(`   DB: ${process.env.DATABASE_URL?.slice(0, 40)}...`);

  const results = [await processCategory(arg)];

  // Summary
  console.log("\n─────────────────────────────────────────");
  console.log("📊 Summary");
  console.log("─────────────────────────────────────────");
  let totalProviders = 0, totalListings = 0, totalGeocoded = 0, totalSkipped = 0;
  for (const r of results) {
    const status = r.error ? `❌ ${r.error.slice(0, 50)}` : `+${r.providers} providers, +${r.listings} listings, ${r.geocoded} geocoded, ${r.skipped} skipped`;
    console.log(`  ${r.category.padEnd(12)} ${status}`);
    totalProviders += r.providers;
    totalListings  += r.listings;
    totalGeocoded  += r.geocoded;
    totalSkipped   += r.skipped;
  }
  console.log("─────────────────────────────────────────");
  console.log(`  TOTAL        +${totalProviders} providers, +${totalListings} listings, ${totalGeocoded} geocoded, ${totalSkipped} skipped`);
  console.log("─────────────────────────────────────────\n");

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("Fatal error:", err);
  await prisma.$disconnect();
  process.exit(1);
});
