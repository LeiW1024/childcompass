#!/usr/bin/env node
// prisma/fix-schedule-notes-en.mjs
// Fix remaining English schedule notes with German translations.
// Usage: node --env-file=.env.local prisma/fix-schedule-notes-en.mjs

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const updates = new Map([
  ["cmmxjrl130008pq066574a0x5", "Montag\u2013Freitag 6:30\u201317:00 Uhr"],
  ["cmmxk0qkx000864lge5c8qnkr", "Montag\u2013Freitag 6:00\u201317:30 Uhr"],
  ["cmmxjrjdl0002pq0688bxvwuf", "Montag\u2013Freitag 6:00\u201317:30 Uhr"],
  ["cmmxk9y87000t64lgmzl0q2v3", "Montag\u2013Donnerstag 10:00\u201318:00, Freitag 10:00\u201314:00 Uhr"],
  ["cmmxk9vic000k64lgg92byx7s", "Mittwochs 14:00\u201316:00 und Freitags 10:00\u201312:00 Uhr"],
  ["cmmxl8hep0002heqt56b6bad3", "Derzeit auf der Suche nach neuem Standort wegen Schlie\u00DFung des Klinik-Schwimmbads"],
  ["cmmxlkloa003f64lgnilvprxk", "Montag\u2013Freitag 8:00\u201316:00 Uhr, 3 Wochen Sommerschlie\u00DFung"],
  ["cmmxlko21003o64lgjav0c8m5", "Montag\u2013Freitag 8:00\u201316:00 Uhr"],
  ["cmmxlkorl003r64lg2filzkgb", "Details auf Anfrage"],
  ["cmmxjrk970005pq06s19brtxr", "Montag\u2013Freitag 6:00\u201317:30 Uhr"],
  ["cmmxlq4j8004264lgs7th3aie", "Montag\u2013Freitag 13:00\u201320:00 Uhr"],
  ["cmmxlkpif003u64lg742la0o3", "Details auf Anfrage"],
  ["cmmxk0p0c000264lglgyqngi3", "Montag\u2013Freitag 6:00\u201317:30 Uhr"],
  ["cmmxk0rd2000b64lg9z7hcxvt", "Montag\u2013Freitag 6:00\u201318:00 Uhr"],
  ["cmmxk0s9w000e64lgdx20jgka", "Montag\u2013Freitag 6:00\u201317:00 Uhr"],
  ["cmmxk9xg5000q64lgx1y25mel", "Derzeit umgezogen wegen Brandschaden \u2013 aktuelle Adresse auf der Website"],
  ["cmmxkm28t002564lgy1i2a4qg", "Kindergeburtstage Freitags nach Vereinbarung, Samstag/Sonntag ab 10:00 Uhr"],
  ["cmmxkvcny002764lgx9gxbh32", "Babykurs Donnerstags 10:30 Uhr, Eltern-Kind-Kurs Dienstags 16:00 Uhr, Rhythmikkurs Dienstags 16:50 Uhr, Musikalische Fr\u00FCherziehung Mittwochs 16:10 und 17:00 Uhr"],
  ["cmmxl8wj0003a64lget3jlakf", "Derzeit auf der Suche nach neuem Standort wegen Schwimmbadschlie\u00DFung"],
]);

async function main() {
  console.log(`Fixing ${updates.size} schedule notes to German...\n`);
  let done = 0, failed = 0;
  for (const [id, scheduleNotes] of updates) {
    try {
      await prisma.listing.update({ where: { id }, data: { scheduleNotes } });
      done++;
    } catch (err) {
      failed++;
      console.error(`  \u274C ${id}: ${err.message}`);
    }
  }
  console.log(`\n\u2705 Done: ${done} updated, ${failed} failed`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("Fatal error:", err);
  await prisma.$disconnect();
  process.exit(1);
});
