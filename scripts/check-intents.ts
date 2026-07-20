import { parseVoiceIntent, buildIntentUrl } from "../src/lib/voice-intents";

const samples = [
  "Find Mass in Wichita",
  "Buscar Misa en Wichita",
  "Lecturas de hoy",
  "today's readings",
  "Misa en línea",
  "watch mass online",
  "peregrinación lourdes",
  "enseñanzas católicas",
  "lugares católicos",
  "Find Mass near me",
];

for (const s of samples) {
  const i = parseVoiceIntent(s);
  console.log(
    (i ? "OK  " : "FAIL") + JSON.stringify(s),
    "=>",
    i ? `${buildIntentUrl(i)} | ${i.locale} | ${i.speak}` : null,
  );
}
