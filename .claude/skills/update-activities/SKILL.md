---
name: update-activities
description: Use when searching for and adding childcare activities to the ChildCompass database — searches one category at a time via Claude API web search (e.g. SWIMMING, SPORTS, MUSIC, DAYCARE)
---

# Update Activities

Searches the web for real childcare providers and activities in Erfurt, Germany (ages 0-6) and adds them to the database via Claude API web search.

**One category per run.** The Anthropic API has a rate limit of 30,000 input tokens/min, so searching all 9 categories at once causes rate-limit errors. Run the script once per category you want to update.

## Environment Prerequisites

Before running, verify these are set in `.env.local`:
- `ANTHROPIC_API_KEY` — required for web search
- `DATABASE_URL` — required for database writes
- `NEXT_PUBLIC_MAPBOX_TOKEN` — required for geocoding addresses

## Usage

Run the script with a single category argument:

```bash
cd /Users/macbookpro/Documents/claude/childcompass && node --env-file=.env.local .claude/skills/update-activities/scripts/update-activities.mjs <CATEGORY>
```

Examples:
```bash
node --env-file=.env.local .claude/skills/update-activities/scripts/update-activities.mjs DAYCARE
node --env-file=.env.local .claude/skills/update-activities/scripts/update-activities.mjs SWIMMING
node --env-file=.env.local .claude/skills/update-activities/scripts/update-activities.mjs MUSIC
```

### Valid Categories

| Category | Examples |
|----------|----------|
| `DAYCARE` | Kindertagesstätten, Krippen, Tagesmütter |
| `PLAYGROUP` | Spielgruppen, Krabbelgruppen |
| `SPORTS` | Kindersport, Turnen, Fußball |
| `ARTS_CRAFTS` | Kreativkurse, Basteln, Malen |
| `MUSIC` | Musikschule, Rhythmik |
| `LANGUAGE` | Sprachkurse für Kinder |
| `SWIMMING` | Schwimmkurse, Baby-Schwimmen |
| `NATURE` | Waldgruppe, Natur-Erlebnisse |
| `EDUCATION` | Lernförderung, Vorschule |

---

## Verification

After running, verify data by querying the database:

```bash
cd /Users/macbookpro/Documents/claude/childcompass && node --env-file=.env.local -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const counts = await p.listing.groupBy({ by: ['category'], _count: true, where: { isPublished: true } });
  console.table(counts);
  const total = await p.listing.count({ where: { isPublished: true } });
  console.log('Total published listings:', total);
  const geocoded = await p.listing.count({ where: { latitude: { not: null } } });
  console.log('Geocoded:', geocoded, '/', total);
  await p.\$disconnect();
})();
"
```

Report to the user:
- Providers added vs skipped (duplicates)
- Listings added vs skipped
- Geocoded count
- Any errors

---

## Troubleshooting

- **"Missing environment variables"** — ensure `.env.local` exists and has the required keys. Use `--env-file=.env.local` flag.
- **Claude API errors** — check `ANTHROPIC_API_KEY` is valid and has credits.
- **Rate limit (429)** — wait 1 minute before running the next category.
- **Geocoding returns null** — address may be too vague. Try a more specific street address.
- **Duplicate skipped** — the script checks by `businessName` (case-insensitive) for providers and by `title + providerProfileId` for listings. This is expected behavior.
