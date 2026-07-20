import { detectLocale, type AppLocale } from "@/lib/speech";

export type VoiceIntent = {
  href: string;
  label: string;
  speak: string;
  locale: AppLocale;
  params?: Record<string, string>;
};

/** Whisper often mishears Mass → Mars / Mas / Must */
function normalizeSpeech(transcript: string): string {
  return transcript
    .toLowerCase()
    .trim()
    .replace(/[.?!,¿¡]+$/g, "")
    .replace(/\b(mars|mas|must|mess)\b/g, "mass")
    .replace(/\b(whichita|wichata|wichitaw)\b/g, "wichita")
    .replace(/\s+/g, " ");
}

function cleanPlace(raw: string): string {
  return raw
    .replace(
      /\b(please|thanks|thank you|por favor|gracias|usa|united states|estados unidos)\b/gi,
      "",
    )
    .replace(/[.?!,¿¡]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractPlace(text: string): string | null {
  const inCity = text.match(
    /\b(?:in|at|en)\s+([a-zà-ÿ][a-zà-ÿ.'-]{2,}(?:\s+[a-zà-ÿ][a-zà-ÿ.']{2,}){0,3})(?:\s*,\s*[a-zà-ÿ. ]+)?/i,
  );
  if (inCity?.[1]) {
    const place = cleanPlace(inCity[1]);
    if (
      place &&
      !/^(me|here|my location|you|mí|mi|aqui|aquí|cerca)$/i.test(place)
    ) {
      return place;
    }
  }

  const nearCity = text.match(
    /\b(?:near|cerca\s+de)\s+(?!me\b|here\b|my\b|mí\b|mi\b)([a-zà-ÿ][a-zà-ÿ.'-]{2,}(?:\s+[a-zà-ÿ][a-zà-ÿ.']{2,}){0,3})/i,
  );
  if (nearCity?.[1]) {
    const place = cleanPlace(nearCity[1]);
    if (place) return place;
  }

  const massCity = text.match(
    /(?:find\s+|busca(?:r)?\s+)?(?:a\s+|una\s+)?(?:mass|misa)(?:\s+times?)?\s+(?:in\s+|at\s+|en\s+|around\s+)(.+)/,
  );
  if (massCity?.[1]) {
    const place = cleanPlace(massCity[1]);
    if (place && !/^(me|here|my location|mí|mi)$/i.test(place)) return place;
  }

  const words = text.split(" ").filter(Boolean);
  if (
    words.length >= 1 &&
    words.length <= 3 &&
    !/\b(mass|misa|church|iglesia|parish|parroquia|reading|lectura|watch|ver|pilgrim|peregrin|teach|enseñ|catholic|católic|spot|confession|confesión|find|busca|near|cerca|today|hoy|daily|diario)\b/.test(
      text,
    )
  ) {
    return cleanPlace(text);
  }

  return null;
}

function labels(locale: AppLocale) {
  if (locale === "es") {
    return {
      massIn: (p: string) => `Buscando Misa en ${p}`,
      massInSpeak: (p: string) => `Buscando Misa en ${p}.`,
      nearMe: "Buscando Misa cerca de ti",
      nearMeSpeak: "Buscando Misa cerca de ti.",
      openFind: "Abriendo Buscar Misa",
      openFindSpeak: "Abriendo Buscar Misa.",
      confession: "Buscando Confesión",
      confessionSpeak: "Buscando confesión.",
      readings: "Abriendo las lecturas de hoy",
      readingsSpeak: "Abriendo las lecturas de hoy.",
      watch: "Abriendo Misas en línea",
      watchSpeak: "Abriendo Misas en línea.",
      lourdes: "Abriendo Lourdes",
      fatima: "Abriendo Fátima",
      guadalupe: "Abriendo Guadalupe",
      pilgrimages: "Abriendo peregrinaciones",
      pilgrimagesSpeak: "Abriendo peregrinaciones.",
      eucharist: "Abriendo enseñanza sobre la Eucaristía",
      creed: "Abriendo el Credo",
      teachings: "Abriendo enseñanzas católicas",
      teachingsSpeak: "Abriendo enseñanzas católicas.",
      placesSubmit: "Abriendo registro de negocio",
      places: "Buscando lugares católicos locales",
      placesSpeak: "Buscando lugares católicos locales.",
      search: (q: string) => `Buscando ${q}`,
      searchSpeak: (q: string) => `Buscando ${q}.`,
    };
  }
  return {
    massIn: (p: string) => `Searching Mass in ${p}`,
    massInSpeak: (p: string) => `Searching for Mass in ${p}.`,
    nearMe: "Finding Mass near you",
    nearMeSpeak: "Finding Mass near you.",
    openFind: "Opening Find Mass",
    openFindSpeak: "Opening Find Mass.",
    confession: "Finding Confession",
    confessionSpeak: "Finding Confession.",
    readings: "Opening today's readings",
    readingsSpeak: "Opening today's readings.",
    watch: "Opening online Mass streams",
    watchSpeak: "Opening online Mass streams.",
    lourdes: "Opening Lourdes",
    fatima: "Opening Fatima",
    guadalupe: "Opening Guadalupe",
    pilgrimages: "Opening pilgrimages",
    pilgrimagesSpeak: "Opening pilgrimages.",
    eucharist: "Opening Eucharist teaching",
    creed: "Opening the Creed",
    teachings: "Opening Catholic teachings",
    teachingsSpeak: "Opening Catholic teachings.",
    placesSubmit: "Opening business registration",
    places: "Finding Catholic local spots",
    placesSpeak: "Finding Catholic local spots.",
    search: (q: string) => `Searching ${q}`,
    searchSpeak: (q: string) => `Searching for ${q}.`,
  };
}

export function parseVoiceIntent(transcript: string): VoiceIntent | null {
  const locale = detectLocale(transcript);
  const text = normalizeSpeech(transcript);
  if (!text) return null;
  const L = labels(locale);

  if (
    /today'?s?\s*readings?|daily readings?|gospel today|bible reading|lecturas?\s+(de\s+)?hoy|lecturas?\s+diarias?|evangelio\s+de\s+hoy/.test(
      text,
    )
  ) {
    return {
      href: "/readings",
      label: L.readings,
      speak: L.readingsSpeak,
      locale,
    };
  }

  if (
    /watch mass|mass online|live mass|stream mass|watch online|misa\s+en\s+l[ií]nea|ver\s+misa|misa\s+en\s+vivo/.test(
      text,
    )
  ) {
    return { href: "/watch", label: L.watch, speak: L.watchSpeak, locale };
  }

  if (
    /pilgrimage|peregrinaci[oó]n|lourdes|fatima|fátima|rome|roma|guadalupe|compostela/.test(
      text,
    )
  ) {
    if (text.includes("lourdes")) {
      return {
        href: "/pilgrimages/lourdes",
        label: L.lourdes,
        speak: `${L.lourdes}.`,
        locale,
      };
    }
    if (text.includes("fatima") || text.includes("fátima")) {
      return {
        href: "/pilgrimages/fatima",
        label: L.fatima,
        speak: `${L.fatima}.`,
        locale,
      };
    }
    if (text.includes("guadalupe")) {
      return {
        href: "/pilgrimages/guadalupe",
        label: L.guadalupe,
        speak: `${L.guadalupe}.`,
        locale,
      };
    }
    return {
      href: "/pilgrimages",
      label: L.pilgrimages,
      speak: L.pilgrimagesSpeak,
      locale,
    };
  }

  if (
    /teaching|catechism|enseñanza|ensenanza|catecismo|what is (the )?eucharist|qu[eé] es (la )?eucarist[ií]a|what is baptism|creed|credo|sacrament|sacramento/.test(
      text,
    )
  ) {
    if (/eucharist|communion|eucarist/.test(text)) {
      return {
        href: "/teachings/sacraments",
        label: L.eucharist,
        speak: `${L.eucharist}.`,
        locale,
      };
    }
    if (/creed|credo/.test(text)) {
      return {
        href: "/teachings/creed",
        label: L.creed,
        speak: `${L.creed}.`,
        locale,
      };
    }
    return {
      href: "/teachings",
      label: L.teachings,
      speak: L.teachingsSpeak,
      locale,
    };
  }

  if (
    /catholic restaurant|local spot|pub near|caf[eé] near|list my business|lugar(?:es)?\s+cat[oó]lic|restaurante\s+cat[oó]lic|registrar\s+(mi\s+)?negocio/.test(
      text,
    )
  ) {
    if (/list my business|register|registrar/.test(text)) {
      return {
        href: "/places/submit",
        label: L.placesSubmit,
        speak: `${L.placesSubmit}.`,
        locale,
      };
    }
    return { href: "/places", label: L.places, speak: L.placesSpeak, locale };
  }

  const place = extractPlace(text);

  if (/confession|confesi[oó]n/.test(text)) {
    return {
      href: "/find",
      label: L.confession,
      speak: L.confessionSpeak,
      locale,
      params: {
        service: "confession",
        ...(place ? { q: place } : { locate: "1" }),
      },
    };
  }

  if (
    place &&
    (/\bmass\b|\bmisa\b|\bchurch(?:es)?\b|\biglesia(?:s)?\b|\bparish(?:es)?\b|\bparroquia(?:s)?\b/.test(
      text,
    ) ||
      /find|busca|buscar|near|cerca|where|d[oó]nde|looking|search/.test(text))
  ) {
    return {
      href: "/find",
      label: L.massIn(place),
      speak: L.massInSpeak(place),
      locale,
      params: { q: place },
    };
  }

  if (
    /\b(mass|misa)\b/.test(text) &&
    /near me|near here|my location|around me|close by|nearby|cerca de m[ií]|cerca de aqui|cerca de aquí/.test(
      text,
    ) &&
    !place
  ) {
    return {
      href: "/find",
      label: L.nearMe,
      speak: L.nearMeSpeak,
      locale,
      params: { locate: "1" },
    };
  }

  if (
    /find mass|busca(?:r)?\s+(una\s+)?misa|mass near|misa cerca|mass times|nearby mass|find a mass|where.*(mass|church|misa|iglesia)|mass in |misa en |church near|parish near|look(?:ing)? for (?:a )?mass|search(?:ing)? (?:for )?(?:a )?mass|go to mass|take me to (?:a )?mass|i need (?:a )?mass/.test(
      text,
    )
  ) {
    if (place) {
      return {
        href: "/find",
        label: L.massIn(place),
        speak: L.massInSpeak(place),
        locale,
        params: { q: place },
      };
    }
    return {
      href: "/find",
      label: L.openFind,
      speak: L.openFindSpeak,
      locale,
      params: {},
    };
  }

  if (place && place.length >= 3) {
    return {
      href: "/find",
      label: L.massIn(place),
      speak: L.massInSpeak(place),
      locale,
      params: { q: place },
    };
  }

  return null;
}

export function buildIntentUrl(intent: VoiceIntent): string {
  const params = new URLSearchParams(intent.params ?? {});
  // Find Mass: announce results after load (closest parish)
  if (intent.href === "/find") {
    params.set("speak", "1");
    params.set("lang", intent.locale);
  }
  const qs = params.toString();
  return qs ? `${intent.href}?${qs}` : intent.href;
}

export function fallbackSearchIntent(query: string): VoiceIntent {
  const locale = detectLocale(query);
  const L = labels(locale);
  return {
    href: "/find",
    label: L.search(query),
    speak: L.searchSpeak(query),
    locale,
    params: { q: query },
  };
}
