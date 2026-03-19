#!/usr/bin/env node
// prisma/backfill-description-de.mjs
// Backfill descriptionDe for all listings.
// - If description is already German (from seed data), copies it to descriptionDe.
// - If description is English and ANTHROPIC_API_KEY is set, translates via Claude API.
// - If no API key, skips English descriptions with a warning.
// Usage: node --env-file=.env.local prisma/backfill-description-de.mjs

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Heuristic: detect if text is likely German (contains umlauts, ß, or common German words)
function looksGerman(text) {
  if (/[äöüÄÖÜß]/.test(text)) return true;
  const deWords = /\b(und|für|mit|der|die|das|den|dem|des|ein|eine|einer|eines|einem|einen|ist|sind|wird|werden|oder|aber|von|zur|zum|aus|bei|nach|über|unter|vor|zwischen|Kinder|Jahren|Plätze|Spielen|Sprache|Bewegung|Musik|Spaß|Kindergarten|Kita|spielerisch|Schwimmen|Förderung)\b/i;
  const matches = text.match(deWords);
  return matches && matches.length >= 2;
}

async function translateToGerman(text) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: `Translate this childcare activity description to German. Return ONLY the German translation, no explanation:\n\n${text}`,
      }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error (${response.status}): ${err.slice(0, 200)}`);
  }

  const data = await response.json();
  return data.content[0].text.trim();
}

async function main() {
  const hasApi = !!process.env.ANTHROPIC_API_KEY;

  const listings = await prisma.listing.findMany({
    where: { descriptionDe: null },
    select: { id: true, title: true, description: true },
  });

  console.log(`Found ${listings.length} listings without German description\n`);
  if (!hasApi) {
    console.log("⚠️  No ANTHROPIC_API_KEY — will copy German descriptions, skip English ones.\n");
  }

  let copied = 0, translated = 0, skipped = 0, failed = 0;

  for (const listing of listings) {
    try {
      if (looksGerman(listing.description)) {
        // Description is already German (from seed) — just copy it
        await prisma.listing.update({
          where: { id: listing.id },
          data: { descriptionDe: listing.description },
        });
        copied++;
        console.log(`📋 [copied]     ${listing.title.slice(0, 55)}`);
      } else if (hasApi) {
        // English description — translate via API
        const de = await translateToGerman(listing.description);
        await prisma.listing.update({
          where: { id: listing.id },
          data: { descriptionDe: de },
        });
        translated++;
        console.log(`✅ [translated] ${listing.title.slice(0, 55)}`);
        // Rate limit
        if (translated % 10 === 0) await new Promise(r => setTimeout(r, 1000));
      } else {
        skipped++;
        console.log(`⏭  [skipped]    ${listing.title.slice(0, 55)} (English, no API key)`);
      }
    } catch (err) {
      failed++;
      console.error(`❌ "${listing.title}": ${err.message}`);
    }
  }

  console.log(`\nDone: ${copied} copied, ${translated} translated, ${skipped} skipped, ${failed} failed`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("Fatal error:", err);
  await prisma.$disconnect();
  process.exit(1);
});
