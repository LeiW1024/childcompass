#!/usr/bin/env node
// prisma/fix-description-de.mjs
// Fix listings where descriptionDe contains English text (was copied instead of translated).
// Usage: node --env-file=.env.local prisma/fix-description-de.mjs

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const updates = new Map([
  ["cmmxlhq2e001mi4474fncdxe6", "Einzigartige Musikkurse f\u00FCr Kindergartenkinder von 2\u20136 Jahren \u2013 Musikerziehung spielerisch und mit viel Spa\u00DF."],
  ["cmmxjrl130008pq066574a0x5", "Ein zertifizierter Kneipp-Kindergarten mit 108 Pl\u00E4tzen f\u00FCr Kinder ab 1 Jahr bis zum Schuleintritt. Inklusive P\u00E4dagogik, gesunde Lebensweise und naturnahes Lernen in zentraler Lage nahe der Altstadt."],
  ["cmmxjrmqe000epq06pnznghh6", "Evangelischer Kindergarten mit christlicher Erziehung und Betreuung. Gemeinschaftsorientierter Ansatz mit Fokus auf spirituelle und pers\u00F6nliche Entwicklung in einer liebevollen Umgebung."],
  ["cmmxk0pt6000564lg49b3wies", "Kindergarten nach Reggio-P\u00E4dagogik in ruhiger Wohnlage. Kinderbetreuung mit Schwerpunkt auf individualisiertem Lernen und Entwicklung in einer kreativen Umgebung."],
  ["cmmxk0t62000h64lg73xjtzva", "Neu er\u00F6ffneter AWO-Kindergarten in zentraler Lage nahe dem Juri-Gagarin-Ring mit hervorragender \u00D6PNV-Anbindung. Geplante Kooperationen mit Seniorenwohngemeinschaften zur F\u00F6rderung des generationen\u00FCbergreifenden Miteinanders."],
  ["cmmxlhzzf002oi447h54w6pcs", "Freier Kindergarten der Initiative Waldorfp\u00E4dagogik Erfurt mit Schwerpunkt auf Kind, Spiel, Natur und Umwelt."],
  ["cmmxli0ri002ri447r7iqsxsp", "Nachhilfezentrum mit Unterst\u00FCtzung in Mathematik, Englisch, Deutsch und weiteren F\u00E4chern. Kostenlose Nachhilfe \u00FCber das Bildungs- und Teilhabepaket m\u00F6glich."],
  ["cmmxlkloa003f64lgnilvprxk", "Waldorfnaher Naturkindergarten, in dem Kinder den ganzen Tag drau\u00DFen spielen \u2013 ohne T\u00FCren und W\u00E4nde. Gartenarbeit, Kochen am offenen Feuer und w\u00F6chentliche Waldtage f\u00FCr 25 Kinder."],
  ["cmmxlkmgz003i64lgpexv957z", "Evangelischer Waldkindergarten, in dem 36 Kinder den Gro\u00DFteil des Tages in der Natur auf Wiesen und in W\u00E4ldern verbringen. Ganzheitliche naturp\u00E4dagogische Bildung mit Spiel ohne vorgefertigtes Material."],
  ["cmmxlko21003o64lgjav0c8m5", "NaturErlebnisGarten mit Umweltbildungsprogrammen f\u00FCr Kindergartengruppen. Praxisnahes Lernen \u00FCber Bienen, biologisches G\u00E4rtnern, Waldaktivit\u00E4ten und Holzwerkstatt."],
  ["cmmxlkorl003r64lg2filzkgb", "Zertifiziertes \u201EHaus der kleinen Forscher\u201C mit t\u00E4glichen Natur- und Umweltaktivit\u00E4ten. Kinder g\u00E4rtnern, ernten und erkunden den Wald \u2013 regelm\u00E4\u00DFige Familien-Forschernachmittage."],
  ["cmmxjrk970005pq06s19brtxr", "Kindergarten nach Fr\u00F6belp\u00E4dagogik f\u00FCr Kinder von 2 Jahren bis zum Schulalter. Ganzheitliche Entwicklungsf\u00F6rderung durch spielbasiertes Lernen und enge Zusammenarbeit mit der benachbarten Krippe Wirbelwind."],
  ["cmmxk0p0c000264lglgyqngi3", "Moderner Kindergarten mit kindzentriertem Ansatz und offenem Konzept nach Reggio-P\u00E4dagogik. 38 Krippen- und 152 Kindergartenpl\u00E4tze in altersgemischten Gruppen ab 1 Jahr bis zum Schuleintritt."],
  ["cmmxk0rd2000b64lg9z7hcxvt", "AWO-Kindergarten in der N\u00E4he des Nordparks mit Betreuung f\u00FCr 170 Kinder ab dem ersten Geburtstag bis zum Schuleintritt. Hochwertige Vollverpflegung und umfassende Bildungsprogramme in gr\u00FCner Umgebung."],
  ["cmmxk0s9w000e64lgdx20jgka", "AWO-Kindergarten f\u00FCr 175 Kinder ab dem ersten Lebensjahr bis zum Schuleintritt im Erfurter Norden. Schwerpunkt auf gesunde Ern\u00E4hrung mit Vollverpflegung und gute \u00D6PNV-Anbindung."],
  ["cmmxlhceo0005i447jtxpwtn7", "Mehrsprachiger Kindergarten des CJD in Erfurt, der europ\u00E4ische Werte und interkulturelle Bildung f\u00FCr Kleinkinder f\u00F6rdert."],
  ["cmmxlhxet002fi447k1vjzo9v", "Waldkindergarten, in dem Kinder t\u00E4glich die Vielfalt der Natur erleben \u2013 an der frischen Luft zu jeder Jahreszeit."],
  ["cmmxlhy8e002ii4478mxfqbn2", "Waldorfnaher Naturkindergarten in Erfurt-Bischleben, er\u00F6ffnet 2021. Drei Fachkr\u00E4fte betreuen 25 Kinder von 2 Jahren bis zum Schuleintritt in naturnaher Umgebung."],
  ["cmmxlkl2d003d64lg9qxqhqw0", "Waldkindergarten, der die Kreativit\u00E4t der Kinder durch freies Spiel in der Natur f\u00F6rdert. Kinder entwickeln Konzentration, Ausdauer und Probleml\u00F6sungsf\u00E4higkeiten und erleben Geborgenheit und Sicherheit in der Gruppe."],
  ["cmmxlkn8y003l64lgjrwjz9br", "Waldorfkindergarten mit Schwerpunkt Natur, Spiel und Umwelt. Biologisches G\u00E4rtnern mit Kindern, jahreszeitliche Feste und naturnahe Aktivit\u00E4ten in einer historischen Bauhaus-Villa."],
  ["cmmxl0klb002v64lgwb7rrr1b", "Englischkurse f\u00FCr Kinder im Kindergarten- und Grundschulalter. Spielerisches Englischlernen in kleinen Gruppen von 5\u20138 Kindern mit Liedern, Reimen, Geschichten und Spielen."],
]);

async function main() {
  console.log(`Fixing ${updates.size} listings with correct German descriptions...\n`);
  let done = 0, failed = 0;
  for (const [id, descriptionDe] of updates) {
    try {
      await prisma.listing.update({ where: { id }, data: { descriptionDe } });
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
