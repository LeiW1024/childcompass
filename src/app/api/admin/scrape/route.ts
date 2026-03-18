// app/api/admin/scrape/route.ts
// Calls Claude API with web_search to find real childcare providers in Erfurt

import { NextResponse } from "next/server";

export const maxDuration = 60; // allow up to 60s for Claude + web search

const CATEGORY_PROMPTS: Record<string, string> = {
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

export async function POST(request: Request) {
  try {
    const { category, ageGroup, city = "Erfurt" } = await request.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY not set in .env" }, { status: 500 });
    }

    const categoryDE = CATEGORY_PROMPTS[category] ?? category;

    const prompt = `You are a research assistant helping build a childcare marketplace for ${city}, Germany.

Search the web for real childcare providers and activities in ${city} that match this category: "${categoryDE}" (${category}).
Target age group: ${ageGroup}.

Find at least 5-8 real providers/activities. For each one, extract:
- businessName: the real name of the provider/organization
- description: 2-3 sentences about what they offer (in English)
- address: street address in ${city} if available
- city: "${city}"
- phone: phone number if available
- website: website URL if available
- category: one of [DAYCARE, PLAYGROUP, SPORTS, ARTS_CRAFTS, MUSIC, LANGUAGE, SWIMMING, NATURE, EDUCATION, OTHER]
- ageMinMonths: minimum age in months (e.g. 0 for babies, 24 for 2 years)
- ageMaxMonths: maximum age in months (e.g. 72 for 6 years)
- price: estimated price as a number (use 0 if unknown)
- pricePer: one of [SESSION, MONTH, WEEK, YEAR]
- scheduleNotes: any schedule info like "Mon & Wed 9-11am" or "Flexible" if unknown
- sourceUrl: the URL where you found this information

Return ONLY a valid JSON array. No markdown, no explanation, just the raw JSON array.
Example format:
[{"businessName":"Name","description":"...","address":"...","city":"Erfurt","phone":"...","website":"...","category":"DAYCARE","ageMinMonths":0,"ageMaxMonths":36,"price":250,"pricePer":"MONTH","scheduleNotes":"Mon-Fri 7am-5pm","sourceUrl":"https://..."}]`;

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
      return NextResponse.json({ error: `Claude API error: ${err}` }, { status: 500 });
    }

    const data = await response.json();

    // Extract text from all content blocks
    const fullText = data.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("\n");

    // Parse JSON from response
    let providers = [];
    try {
      // Try to find JSON array in the response
      const jsonMatch = fullText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        providers = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON array found in response");
      }
    } catch (parseErr) {
      return NextResponse.json({
        error: "Could not parse Claude response as JSON",
        rawResponse: fullText.slice(0, 500),
      }, { status: 422 });
    }

    return NextResponse.json({ providers, count: providers.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
