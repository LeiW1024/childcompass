#!/usr/bin/env node
// prisma/backfill-descriptions-manual.mjs
// One-time script: manually translated German descriptions for scraped listings.
// Usage: node --env-file=.env.local prisma/backfill-descriptions-manual.mjs

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const translations = new Map([
  ["cmmxlq80v004f64lgnyekudrz", "Bietet Lernf\u00F6rderung und Nachhilfe f\u00FCr Kinder in Erfurt. Individuelle p\u00E4dagogische Unterst\u00FCtzung und anerkannter Anbieter f\u00FCr staatlich gef\u00F6rderte Lernf\u00F6rderungsprogramme."],
  ["cmmxklz70001t64lgtwexhzgc", "Kunstschule mit Kursen in Malerei, Zeichnung, Keramik und Drucktechniken. Kinder und Jugendliche k\u00F6nnen ihrer Fantasie freien Lauf lassen und bildende Kunst in inspirierender Umgebung \u00FCben."],
  ["cmmxlhosl001hi447bfkxuyvh", "Kunstatelier und Malschule in Erfurt mit Kursen in Malerei, Zeichnung, Keramik und mehr f\u00FCr Kinder und Erwachsene."],
  ["cmmxlhdwl000bi447n3z5z0xk", "Die AWO betreibt mehrere Kinderg\u00E4rten in Erfurt und bietet qualitativ hochwertige Kinderbetreuung mit Schwerpunkt auf sozialer Bildung und Gemeinschaftswerten."],
  ["cmmxjrnjg000hpq069z4fr2qj", "AWO-Kindertagesst\u00E4tte mit umfassendem Betreuungsangebot. Bildungsprogramme und Aktivit\u00E4ten f\u00FCr Kinder in einem unterst\u00FCtzenden Gemeinschaftsumfeld mit erfahrenem Personal."],
  ["cmmxlhpck001ji447bgreawfa", "Gr\u00F6\u00DFte Musikschule Th\u00FCringens mit ca. 2.200 Sch\u00FClern. Baby-Musikgarten ab 5 Monaten, Eltern-Kind-Kurse und Rhythmikkurse. Musikalische Fr\u00FCherziehung in Kitas und an der Schule."],
  ["cmmxl0m72003164lguqiganoe", "Internationale Sprachschule mit verschiedenen Sprachkursen f\u00FCr Kinder und Jugendliche ab 6 Jahren. W\u00F6chentliche Kurse sowie Sprachcamps in den Schulferien nach der bew\u00E4hrten Berlitz-Methode."],
  ["cmmxlhtvs0021i4476beldzam", "Berlitz-Sprachschule mit w\u00F6chentlichen Sprachkursen f\u00FCr Kinder und Jugendliche ab 6 Jahren sowie Sprachcamps in den Schulferien."],
  ["cmmxlhri9001si447gh7jn7ke", "Premium-Musikschule in Erfurt mit musikalischer Bildung f\u00FCr Kinder im Rahmen des Company-Kids-Programms."],
  ["cmmxlhvgy0027i447krhlwjub", "Schwimmschule mit beliebten Kinderschwimmkursen im Katholischen Krankenhaus St. Johann Nepomuk bei angenehmen Wassertemperaturen um 31\u00B0C."],
  ["cmmxl8i930005heqtislwre20", "Schwimmschule mit Babyschwimmen f\u00FCr 6\u201312 Monate, Kleinkindkursen f\u00FCr 1\u20133 Jahre und Kinderschwimmkursen ab 4 Jahren. Qualifizierter Schwimmunterricht seit 1997."],
  ["cmmxlhw5n002ai447blaqhgkq", "Die Deutsche Lebens-Rettungs-Gesellschaft (DLRG) Erfurt bietet Schwimmkurse und Wassersicherheitstraining f\u00FCr Kinder an."],
  ["cmmxl8kiy000cheqttu4c0k1b", "Deutsche Lebens-Rettungs-Gesellschaft mit Schwimmkursen f\u00FCr Kinder und Fokus auf Wassersicherheit und Rettungsschwimmen. Professioneller Schwimmunterricht und Sicherheitsausbildung."],
  ["cmmxkve6i002d64lggxwessbc", "Junge und familienfreundliche Musikschule mit professionellem, effektivem und humorvollem Unterricht. Musikalische Fr\u00FCherziehung mit Singen, Tanzen, Trommeln und Instrumentenerkundung f\u00FCr Kinder."],
  ["cmmxlq8tt004i64lgowk0sgj7", "Ganzheitliche Lerntherapie f\u00FCr Kinder mit Lese-Rechtschreib-Schw\u00E4che, Dyskalkulie, ADHS und allgemeinen Lernschwierigkeiten. Individuelle F\u00F6rderung und Beratung f\u00FCr Kinder und Familien."],
  ["cmmxlhjzy000yi447xp2ioibo", `Eltern-Kind-Turnen \u201EKleine Springm\u00E4use\u201C f\u00FCr Kinder von 1\u20132 Jahren im Familienzentrum am Anger in Erfurt.`],
  ["cmmxlhkqx0011i4470e52ptls", "Eltern-Kind-Turnen bei einem der \u00E4ltesten Sportvereine Erfurts. Eine tolle M\u00F6glichkeit f\u00FCr Kleinkinder, gemeinsam mit ihren Eltern motorische F\u00E4higkeiten zu entwickeln."],
  ["cmmxlhsm0001wi447ap2vkb55", "Englischkurse in Kinderg\u00E4rten und Schulen seit 2000. Kinder ab 4 Jahren lernen spielerisch in kleinen Gruppen von 5\u20138 Kindern mit Muttersprachler-Methoden."],
  ["cmmxl0lfg002y64lg97jif9bi", "Englisch-Sprachschule mit verschiedenen Kursen inklusive Nachhilfe, Ferien-Englisch und Business-Englisch. Standort im Norden Erfurts in Gispersleben mit entspannter Atmosph\u00E4re und einzigartigem Lehrkonzept."],
  ["cmmxlhtbk001zi447h7o60vjn", `Englisch-Sprachschule mit \u201EEnglish with Tiger Power\u201C f\u00FCr Schulkinder, in kleinen Gruppen oder Einzelunterricht.`],
  ["cmmxl8lct000eheqtd492xowf", "Gr\u00F6\u00DFter Schwimmverein Erfurts mit fast 400 Mitgliedern und Schwimmprogrammen f\u00FCr alle Altersgruppen. Umfassendes Training vom Anf\u00E4nger bis zum Leistungsschwimmen mit qualifizierten Trainern."],
  ["cmmxlhwpg002ci447o38417d8", "Erfurter Schwimmsportclub mit Anf\u00E4ngerkursen ab 5 Jahren f\u00FCr Schwimmen und Wasserball."],
  ["cmmxjrlwx000bpq06a1wimren", "Evangelische Kindertagesst\u00E4tte mit christlich gepr\u00E4gter Betreuung und Bildung. Umfassende fr\u00FChkindliche Entwicklung in einem glaubensbasierten Umfeld mit qualifiziertem p\u00E4dagogischem Personal."],
  ["cmmxk9xg5000q64lgx1y25mel", "Familienzentrum als Raum f\u00FCr Familienaustausch und gemeinsame Zeit. Verschiedene Workshops, kreative Aktivit\u00E4ten und Veranstaltungen f\u00FCr Familien mit Kindern."],
  ["cmmxke4df001k64lgi7q01xdh", "Spielerisches Bewegungsprogramm f\u00FCr Kinder von 2\u20134 Jahren mit Bezugspersonen. Verbindet kreatives Spiel, freies Erkunden und Yoga-/Achtsamkeitselemente f\u00FCr K\u00F6rperwahrnehmung und Verbindung."],
  ["cmmxk9y87000t64lgmzl0q2v3", "Familienzentrum mit vielf\u00E4ltiger Familienbildung, Beratung und Freizeitprogrammen. Eltern-Kind-Aktivit\u00E4ten wie Spielgruppen, Mutter-Kind-Turnen und verschiedene Workshops im Stadtteil Melchendorf."],
  ["cmmxlhbor0002i447akccv9lu", "Kreative Kita in Erfurt mit Schwerpunkt auf k\u00FCnstlerischer und spielerischer Entwicklung. Ganztagsbetreuung mit Fokus auf kreativem Ausdruck."],
  ["cmmxke566001n64lgip25k2dn", "Fu\u00DFballschule mit Camps f\u00FCr Kinder von 6\u201312 Jahren. F\u00FCnft\u00E4gige Programme mit Training, Ausr\u00FCstung, Verpflegung und professionellem Coaching f\u00FCr alle Spielst\u00E4rken."],
  ["cmmxke28u001b64lgnj9tkqe1", "Eltern-Kind-Sport und eigenst\u00E4ndiges Kinderturnen mit Fokus auf motorische Entwicklung und spielerische Bewegung. Verschiedene Kurse f\u00FCr Kinder von 1\u20136 Jahren."],
  ["cmmxk9vic000k64lgg92byx7s", "Theater mit kreativen Krabbelgruppen und Tanzworkshops f\u00FCr Babys und Kinder. Spielerische Einheiten mittwochs und freitags mit Freispielzeit, Kaffee f\u00FCr Eltern und Tiertanz-Workshops ab 2 Jahren."],
  ["cmmxka0ip001264lgns9ucyne", "Hebammenpraxis mit Babymassage und PEKiP-Programmen f\u00FCr Eltern und Babys. Strukturierte Kurse zu Bindung, Babyentwicklung und Elternunterst\u00FCtzung in kleinen Gruppen."],
  ["cmmxl0jvi002s64lg6xua02ve", "Sprachschule mit Englisch- und Franz\u00F6sischkursen f\u00FCr Kinder ab 4 Jahren. Vorschulkinder lernen Sprachen schneller und leichter durch spielerische, ganzheitliche Lernmethoden."],
  ["cmmxli3o60033i447pvqjwsg8", "Integrative Lerntherapie mit spezieller Lernf\u00F6rderung f\u00FCr Kinder mit Lernschwierigkeiten."],
  ["cmmxlhms60019i4476tgxc6jr", "Jugendkunstschule mit \u00FCber 20 Kursen in Malerei, Grafik, fig\u00FCrlichem Zeichnen, Druckgrafik und Plastik. Auch Ferien- und Wochenendworkshops."],
  ["cmmxklyeg001q64lgare1d9mq", "Jugendkunstschule mit Kursen in bildender Kunst wie Malerei, Zeichnung, Basteln, Keramik und mehr f\u00FCr Kinder ab 4 Jahren. W\u00F6chentliche Kurse und kreative Workshops mit individueller F\u00F6rderung k\u00FCnstlerischer Talente."],
  ["cmmxlq9nb004l64lg514ui8jt", "Individuelle Lernf\u00F6rderung f\u00FCr Sch\u00FCler aller Altersgruppen mit Lern- und Leistungsproblemen. Einzel- und Gruppenunterricht mit Einheiten von 60, 90 oder 180 Minuten inklusive kostenlosem Erstgespr\u00E4ch."],
  ["cmmxk0qkx000864lge5c8qnkr", "Integrative Kindertagesst\u00E4tte der Lebenshilfe Erfurt f\u00FCr Kinder mit und ohne Behinderung. Spezielle Ausstattung mit Wellnessbereich, Sauna, Therapier\u00E4umen und umfassenden F\u00F6rderangeboten."],
  ["cmmxlhesf000ei447rllmexms", "Kinderbetreuung an der Universit\u00E4t Erfurt f\u00FCr Kinder von Universit\u00E4tsmitarbeitern und Studierenden."],
  ["cmmxlhnix001ci447v3nt12ie", "Kindermalkurse und Workshops in Erfurt. Saisonale Workshops wie Ostermalen f\u00FCr Kinder von 6\u201313 Jahren."],
  ["cmmxlhuef0023i447j3mxr5va", "St\u00E4dtische Schwimmkurse der Stadtwerke Erfurt. Babyschwimmen und Vorschulschwimmen mit Wassergew\u00F6hnung, Springen, Gleiten und Tauchen."],
  ["cmmxlhlgl0014i447h0pi5z8s", "Kinderturnen bei ESV Lokomotive Erfurt mit strukturiertem Programm f\u00FCr junge Kinder."],
  ["cmmxlhm7j0017i447eevo3hc5", "Sportverein mit Kinderturnen, Cheerleading und Yoga-Programmen f\u00FCr Kinder in Erfurt."],
  ["cmmxjrjdl0002pq0688bxvwuf", "Krippe mit Reggio-P\u00E4dagogik f\u00FCr Kinder von 1\u20133 Jahren. Individueller, kindgerechter Ansatz mit kreativer und ganzheitlicher Entwicklung durch Sinneslernen."],
  ["cmmxlho8y001fi4476cd7i5st", "Kunstraum in Erfurt mit Kreativkursen und Workshops f\u00FCr Kinder und Erwachsene."],
  ["cmmxkm28t002564lgy1i2a4qg", "Kreatives Kunstatelier mit Kindergeburtstagen und Kreativworkshops. Praktische Kunstaktivit\u00E4ten und Bastelerlebnisse f\u00FCr Kinder in kleinen Gruppen."],
  ["cmmxklzw7001w64lgvw94wgti", "Kunstschule mit vielf\u00E4ltigen Kreativworkshops f\u00FCr Kinder: Malen, Basteln, Skulpturen und saisonale Kreativprojekte. Von Einzelsitzungen bis zu w\u00F6chentlichen Programmen."],
  ["cmmxlq5u6004764lgcjelhm4l", "Spezialisiert auf Hilfe bei Lese-Rechtschreib-Schw\u00E4che, Legasthenie und Lernbehinderungen. Unter Leitung von Nancy Lehmann bieten sie systematische p\u00E4dagogische Therapie statt einfacher Nachhilfe."],
  ["cmmxli28g002xi447k4xlm5aa", "Spezialisiertes Lerntherapiezentrum f\u00FCr Legasthenie und Lese-Rechtschreib-Schwierigkeiten mit wissenschaftlich best\u00E4tigten Methoden und Standards."],
  ["cmmxli1iv002ui447fquw1be8", "Lerninstitut mit Nachhilfe und Lernf\u00F6rderung f\u00FCr alle Sch\u00FCler im Raum Erfurt, unabh\u00E4ngig von Klasse oder Schulart."],
  ["cmmxkm0ok001z64lgbmt1fptv", "Eltern-Kind-Nachmittagsprogramm, bei dem Eltern und Kinder gemeinsam kreativ basteln, Spiele spielen und Geschichten lesen. Familienfreundliche Kreativaktivit\u00E4ten in gemeinschaftlicher Atmosph\u00E4re."],
  ["cmmxlq57p004564lg27tgudzz", "Nachhilfe und Lernf\u00F6rderung f\u00FCr alle Sch\u00FCler im Raum Erfurt. Individuelle Heimnachhilfe und verschiedene Bildungsunterst\u00FCtzungsangebote inklusive Lerntherapie und Schulbegleitung."],
  ["cmmxl0j1h002p64lgt0g4w1zn", "Englisch-Sprachschule mit Kursen f\u00FCr Kinder von 2\u20134 Jahren mit spielerischen Methoden, Spielen, Liedern und Kreativmaterialien. Kinder lernen spielerisch und entwickeln einen Wortschatz von ca. 500 W\u00F6rtern und 14 englischen Liedern innerhalb eines Jahres."],
  ["cmmxke1gt001864lgjlwnb7lh", "Eltern-Kind-Turnen mit strukturierten Aktivit\u00E4ten f\u00FCr Kinder von 1,5\u20136 Jahren in Begleitung der Eltern. Mehrere Einheiten an verschiedenen Standorten unter der Woche."],
  ["cmmxkvfkz002j64lgsibvt6pa", "Renommierte Musikschule f\u00FCr Rock-, Jazz- und Popmusik. Kids-Programm f\u00FCr Kinder von 2\u20136 Jahren mit musikalischer Fr\u00FCherziehung in Melodie, Harmonie und Rhythmus. Bewegungsspiele, Lieder, T\u00E4nze und kreative Aktivit\u00E4ten."],
  ["cmmxkm1h1002264lgzxvx5rsd", "Musikalische Fr\u00FCherziehung f\u00FCr Kinder von 2\u20136 Jahren mit kreativen Elementen wie Malen und Basteln neben musikalischen Aktivit\u00E4ten. Verbindet Musikerziehung mit Kunst und Handwerk."],
  ["cmmxlhqsy001pi4477nywzo6l", "Einzigartige Eltern-Kind-Kurse in musikalischer Fr\u00FCherziehung f\u00FCr Kinder von Geburt bis sechs Jahren."],
  ["cmmxkvcny002764lgx9gxbh32", "St\u00E4dtische Musikschule mit Baby-Musikgarten ab 5 Monaten, Eltern-Kind-Kursen und Rhythmikkursen f\u00FCr Kleinkinder. Musikalische Fr\u00FCherziehung mit Liedern, Reimen und Bewegungsspielen gemeinsam mit Bezugspersonen."],
  ["cmmxkvew3002g64lgffitp154", "Spezialisierte musikalische Fr\u00FCherziehung mit Eltern-Kind-Kursen von Geburt bis 6 Jahre. Altersgerechte Gruppen: 0\u20131, 1\u20132,5, 2,5\u20134 und 4\u20136 Jahre. Auch Trommelkurse f\u00FCr 3\u20136 Jahre."],
  ["cmmxkvdgt002a64lgnqqx8a3j", "Premium-Musikschule mit musikalischer Fr\u00FCherziehung f\u00FCr Kinder von 0\u20136 Jahren. Gemeinsames Singen, Bewegen zur Musik und altersgerechte Einf\u00FChrung in Rhythmen, Melodien und Instrumente. Flexible Einstiegszeiten und kostenlose Probestunden."],
  ["cmmxk9w7p000n64lghem00o4l", "Offene Krabbelgruppe organisiert von und mit Eltern als ehrenamtliches Angebot. Raum zum Spielen f\u00FCr Kinder und Erfahrungsaustausch f\u00FCr Eltern, mit musikalischen und kreativen Inhalten."],
  ["cmmxlhfh0000gi4476l5b2x97", "Kostenlose offene Krabbelgruppe jeden Mittwoch 9:30\u201311:00 Uhr. Ehrenamtlich geleitete Eltern-Kind-Gruppe f\u00FCr alle Altersgruppen \u2013 ohne Anmeldung."],
  ["cmmxk9zuk000z64lg4w1nalup", "P\u00E4dagogisches Institut mit PEKiP-Kursen und verschiedenen Eltern-Kind-Programmen. Strukturierte Entwicklungsf\u00F6rderung f\u00FCr Babys im ersten Lebensjahr mit qualifizierten Kursleitern in kleinen Gruppen."],
  ["cmmxlhj8t000vi447d3h7eys2", "Abwechslungsreicher Kindersport f\u00FCr Jungen und M\u00E4dchen von 4\u20136 Jahren mit spielerischer Bewegung, Turnen und Ballsporteinf\u00FChrung."],
  ["cmmxlq6dr004964lgrvbdvurh", "Professionelle Nachhilfe in Mathe, Deutsch, Englisch und weiteren F\u00E4chern von der Grundschule bis zum Abitur. Einzelnachhilfe in kleinen Gruppen von 3\u20135 Sch\u00FClern mit kostenlosen Probestunden."],
  ["cmmxlq77n004c64lgnwm80s0o", "Nachhilfezentrum im Zentrum Erfurts mit professioneller Unterst\u00FCtzung in Mathe, Deutsch, Englisch und vielen weiteren F\u00E4chern. Pr\u00E4senz- und Online-Nachhilfe mit zertifizierten Lernmethoden und erfahrenen Lehrkr\u00E4ften."],
  ["cmmxli2yl0030i4473id36vep", "Professionelles Nachhilfezentrum in Erfurt mit Unterst\u00FCtzung in Mathe, Deutsch, Englisch und weiteren F\u00E4chern zu g\u00FCnstigen Preisen."],
  ["cmmxlhuxa0025i4470mw1ly9g", "Schwimmkurse f\u00FCr Vorschulkinder beim SSV Erfurt-Nord, einem der engagierten Schwimmvereine Erfurts."],
  ["cmmxl8vs9003764lgdqtl4tjg", "DELFISH bietet Kinderschwimmkurse im Hallenbad des Krankenhauses St. Johann Nepomuk. Das Becken hat eine Wassertiefe von 1,30 m und angenehme 31\u00B0C Wassertemperatur \u2013 ideal f\u00FCr Schwimmanf\u00E4nger."],
  ["cmmxke2x6001e64lgbvu6iep8", "Sportprogramm f\u00FCr Vorschulkinder von 4\u20136 Jahren mit spielerischer Bewegung, Turnen und Ballsporteinf\u00FChrung. Fokus auf motorische Entwicklung, Spa\u00DF und Teamwork."],
  ["cmmxlq413004064lg6f98g1d5", "Nachhilfe f\u00FCr Grundsch\u00FCler in Deutsch, Englisch und Mathe. Hausaufgabenhilfe, Homeschooling-Unterst\u00FCtzung und Vorschulvorbereitung mit altersgerechten Lernans\u00E4tzen."],
  ["cmmxlhgx8000mi4471fqbpx8z", "Von Eltern organisierte Spielgruppen zur gegenseitigen Unterst\u00FCtzung. Einladender Raum f\u00FCr Eltern und Kleinkinder zum Spielen und Kontaktekn\u00FCpfen."],
  ["cmmxlhg7o000ji447r0h73kry", "Spielgruppen f\u00FCr Eltern mit Kindern von 1\u20133 Jahren, organisiert von der Evangelischen Familienbildung in Erfurt."],
  ["cmmxlhifg000si447y6ja2eoh", "Zertifizierter Anbieter f\u00FCr Kindersport und Pr\u00E4ventionsprogramme. Vielf\u00E4ltige Angebote f\u00FCr Kinder ab 3 Jahren inklusive Sportcamps und Fu\u00DFballcamps."],
  ["cmmxlhs1z001ui4471zp080y4", "Sprachkurse f\u00FCr Kinder ab 4 Jahren in Englisch und Franz\u00F6sisch. Kurse in Kinderg\u00E4rten oder vor Ort in kleinen Gruppen von 5\u20138 Kindern."],
  ["cmmxl8jsn000aheqtln9pvk8e", "Sportverein mit Schwimmkursen f\u00FCr Vorschulkinder mit erfahrenen \u00DCbungsleitern und Trainern. Altersgerechter Schwimmunterricht von den Grundlagen bis zur Wassergew\u00F6hnung."],
  ["cmmxlq4j8004264lgs7th3aie", "Nachhilfe in Mathe, Englisch, Deutsch und weiteren F\u00E4chern mit qualifizierten Lehrkr\u00E4ften. Individuelle F\u00F6rderung in kleinen Gruppen mit Unterst\u00FCtzung bei staatlicher Lernf\u00F6rderung \u00FCber das Bildungs- und Teilhabepaket."],
  ["cmmxkvgfz002m64lge8bgeff7", "Private Musikschule mit musikalischer Fr\u00FCherziehung f\u00FCr Kinder ab 3 Jahren. Gemischte Gruppen bis 6 Kinder nach dem Motto \u201EKleine lernen von Gro\u00DFen\u201C. Umfassende musikalische Grundausbildung und Instrumentenerkundung."],
  ["cmmxl8j410008heqtt3ct47mg", "St\u00E4dtische Schwimmb\u00E4der mit Babyschwimmen, Vorschulschwimmkursen und Kinderschwimmunterricht. Umfassendes Schwimmangebot mit M\u00F6glichkeit zum Erwerb des Seepferdchen-Abzeichens."],
  ["cmmxke3p3001h64lgclnb2kti", "Sportprogramm f\u00FCr Kinder von 4\u20136 Jahren mit Turnen, Laufen, Springen und verschiedenen Ballspielelementen. Geleitet von qualifizierten Trainern mit Fokus auf Spa\u00DF und Bewegung."],
  ["cmmxke0pv001564lgfopysng0", "Kindersportangebote mit Eltern-Kind-Turnen f\u00FCr 2\u20136 Jahre und eigenst\u00E4ndigem Turnen f\u00FCr Kinder von 4\u20136 Jahren. Fokus auf motorische F\u00E4higkeiten, soziale Entwicklung und spielerische Bewegung."],
  ["cmmxlhhp8000pi4479u13nzdc", "Universit\u00E4tssportverein mit Kindersport \u2013 Bewegung, Entdecken, Mitmachen und Spielen. Trainingszeit von Oktober bis Juni."],
  ["cmmxlq3au003x64lgnk6dwkr8", "Volkshochschule mit Nachhilfekursen f\u00FCr Sch\u00FCler der 3.\u201312. Klasse in Deutsch, Englisch, Franz\u00F6sisch, Mathematik, Chemie und Physik. Individuelle Lernf\u00F6rderung, auf Wunsch auch Online-Kurse."],
  ["cmmxl0n1o003464lg6ddwj4yq", "Volkshochschule mit Sprachkursen f\u00FCr Kinder. Englischkurse f\u00FCr verschiedene Altersgruppen mit g\u00FCnstigen Preisen und flexibler Terminplanung."],
  ["cmmxl8hep0002heqt56b6bad3", "Babyschwimmen f\u00FCr S\u00E4uglinge von 1\u20136 Monaten, durchgef\u00FChrt von einer Physiotherapeutin mit \u00FCber 10 Jahren Erfahrung. Inklusive Unterwasser-Fotoshooting am Kursende."],
  ["cmmxl8wj0003a64lget3jlakf", "Ines Stecker, Physiotherapeutin, f\u00FChrt seit \u00FCber 10 Jahren Babyschwimmen in Erfurt durch. Babyschwimmen beginnt idealerweise in den ersten 6 Lebensmonaten und nutzt die Reflexe des Babys zur F\u00F6rderung der motorischen Entwicklung."],
  ["cmmxk9z5t000w64lgntvph86l", "PEKiP- und Babyentwicklungszentrum mit professionellen Eltern-Kind-Kursen. Strukturierte PEKiP-Programme f\u00FCr Babys ab 4\u20136 Wochen zur Unterst\u00FCtzung der kindlichen Entwicklung und Eltern-Kind-Bindung durch Spielaktivit\u00E4ten."],
]);

async function main() {
  console.log(`Updating ${translations.size} listings with German descriptions...\n`);

  let done = 0, failed = 0;
  for (const [id, descDe] of translations) {
    try {
      await prisma.listing.update({
        where: { id },
        data: { descriptionDe: descDe },
      });
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
