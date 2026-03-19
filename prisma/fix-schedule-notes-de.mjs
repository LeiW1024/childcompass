#!/usr/bin/env node
// prisma/fix-schedule-notes-de.mjs
// One-time script: update English schedule notes to German.
// Usage: node --env-file=.env.local prisma/fix-schedule-notes-de.mjs

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const updates = new Map([
  ["cmmxklz70001t64lgtwexhzgc", { scheduleNotes: "Semesterbasierte Kurse f\u00FCr Kinder und Jugendliche" }],
  ["cmmxl0m72003164lguqiganoe", { scheduleNotes: "W\u00F6chentliche Kurse, Sprachcamps in den Schulferien" }],
  ["cmmxl8kiy000cheqttu4c0k1b", { scheduleNotes: "Derzeit keine freien Schwimmkurse, Warteliste ca. ein Jahr" }],
  ["cmmxl0lfg002y64lg97jif9bi", { scheduleNotes: "Kurse f\u00FCr Sch\u00FCler Klasse 5\u201312" }],
  ["cmmxl8lct000eheqtd492xowf", { scheduleNotes: "Trainingsgruppen nach Alter und Leistungsstufe" }],
  ["cmmxke4df001k64lgi7q01xdh", { scheduleNotes: "Mehrere Kursbl\u00F6cke im Jahr, 15:30\u201317:45 Uhr" }],
  ["cmmxke566001n64lgip25k2dn", { scheduleNotes: "5-Tage-Camps in den Schulferien" }],
  ["cmmxke28u001b64lgnj9tkqe1", { scheduleNotes: "Verschiedene Kurse unter der Woche" }],
  ["cmmxlkl2d003d64lg9qxqhqw0", { scheduleNotes: "Infos auf der Website" }],
  ["cmmxlkn8y003l64lgjrwjz9br", { scheduleNotes: "Aktuelle Zeiten auf Anfrage" }],
  ["cmmxka0ip001264lgns9ucyne", { scheduleNotes: "Babymassage freitags (5 Einheiten), PEKiP 10 Einheiten \u00E0 1,5 Stunden" }],
  ["cmmxklyeg001q64lgare1d9mq", { scheduleNotes: "W\u00F6chentliche Kurse und Workshops" }],
  ["cmmxlq9nb004l64lg514ui8jt", { scheduleNotes: "Einheiten von 60, 90 oder 180 Minuten verf\u00FCgbar" }],
  ["cmmxklzw7001w64lgvw94wgti", { scheduleNotes: "Verschiedene Zeiten \u2013 Sa + So, teils w\u00F6chentliche Kurse" }],
  ["cmmxl0klb002v64lgwb7rrr1b", { scheduleNotes: "W\u00F6chentliche Treffen in kleinen Gruppen" }],
  ["cmmxlq57p004564lg27tgudzz", { scheduleNotes: "Flexible Terminplanung mit Nachhilfelehrern" }],
  ["cmmxke1gt001864lgjlwnb7lh", { scheduleNotes: "Di\u2013Fr verschiedene Zeiten, derzeit keine Neuanmeldungen" }],
  ["cmmxkvfkz002j64lgsibvt6pa", { scheduleNotes: "4 \u00D7 45 Min. Gruppenunterricht/Monat, 8\u201310 Kinder/Gruppe, Kursstart Jahresanfang oder nach Sommerferien" }],
  ["cmmxkm1h1002264lgzxvx5rsd", { scheduleNotes: "W\u00F6chentliche Kurse, B\u00FCrozeiten Mo\u2013Sa 10:00\u201322:00, So 10:00\u201320:00 Uhr" }],
  ["cmmxkvew3002g64lgffitp154", { scheduleNotes: "Altersgruppen: 0\u20131 J., 1\u20132,5 J., 2,5\u20134 J., 4\u20136 J., flexibler Einstieg" }],
  ["cmmxkvdgt002a64lgnqqx8a3j", { scheduleNotes: "Flexibler Einstieg, kostenlose Probestunde m\u00F6glich" }],
  ["cmmxk9zuk000z64lg4w1nalup", { scheduleNotes: "Verschiedene Zeiten verf\u00FCgbar, 6er-Kurskarten erh\u00E4ltlich" }],
  ["cmmxke2x6001e64lgbvu6iep8", { scheduleNotes: "Probetraining m\u00F6glich" }],
  ["cmmxl8jsn000aheqtln9pvk8e", { scheduleNotes: "Schwimmkurse 2024/25 und 2025/26 ausgebucht" }],
  ["cmmxkvgfz002m64lge8bgeff7", { scheduleNotes: "Altersgemischte Gruppen bis 6 Kinder" }],
  ["cmmxl8j410008heqtt3ct47mg", { scheduleNotes: "14 Kurseinheiten, je 45 Minuten, zweimal w\u00F6chentlich" }],
  ["cmmxke3p3001h64lgclnb2kti", { scheduleNotes: "Derzeit keine freien Pl\u00E4tze, Warteliste m\u00F6glich" }],
  ["cmmxke0pv001564lgfopysng0", { scheduleNotes: "Verschiedene Zeiten Di\u2013Do 16:00\u201318:00 Uhr, Oktober bis Juni" }],
  ["cmmxlq3au003x64lgnk6dwkr8", { scheduleNotes: "Individuelle Terminvereinbarung m\u00F6glich" }],
  ["cmmxl0n1o003464lg6ddwj4yq", { scheduleNotes: "Flexible Kurszeiten inkl. abends und am Wochenende" }],
  ["cmmxk9z5t000w64lgntvph86l", { scheduleNotes: "10 Einheiten \u00E0 90 Minuten, einmal w\u00F6chentlich" }],
]);

async function main() {
  console.log(`Updating ${updates.size} listings with German schedule notes...\n`);
  let done = 0, failed = 0;
  for (const [id, data] of updates) {
    try {
      await prisma.listing.update({ where: { id }, data });
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
