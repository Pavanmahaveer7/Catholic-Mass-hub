export type Locale = "en" | "es";

const COOKIE = "mass_locale";

export const copy = {
  en: {
    brand: "Catholic Mass Hub",
    tagline: "Find Mass. Grow in faith. Wherever you are.",
    heroBody:
      "Parish finder, official USCCB readings, live Mass streams, pilgrimages, classic catechesis, and Catholic community spots — in English and Spanish.",
    findMass: "Find Mass Near Me",
    todaysReadings: "Today's Readings",
    askVoice: "Ask by voice",
    todaysGospel: "Today's Gospel",
    readFull: "Read the full readings",
    explore: "Explore the Church",
    teachingOfDay: "Teaching of the day",
    myParishes: "My parishes",
    saveParish: "Save parish",
    saved: "Saved",
    newThisMonth: "New this month",
    about: "About & sources",
    localeLabel: "ES",
  },
  es: {
    brand: "Catholic Mass Hub",
    tagline: "Encuentra la Misa. Crece en la fe. Donde estés.",
    heroBody:
      "Buscador de parroquias, lecturas oficiales de la USCCB, Misas en vivo, peregrinaciones, catequesis clásica y lugares católicos — en inglés y español.",
    findMass: "Misa cerca de mí",
    todaysReadings: "Lecturas de hoy",
    askVoice: "Preguntar por voz",
    todaysGospel: "Evangelio de hoy",
    readFull: "Leer las lecturas completas",
    explore: "Explorar la Iglesia",
    teachingOfDay: "Enseñanza del día",
    myParishes: "Mis parroquias",
    saveParish: "Guardar parroquia",
    saved: "Guardada",
    newThisMonth: "Nuevo este mes",
    about: "Acerca de y fuentes",
    localeLabel: "EN",
  },
} as const;

export function t(locale: Locale) {
  return copy[locale] ?? copy.en;
}

export { COOKIE as LOCALE_COOKIE };
