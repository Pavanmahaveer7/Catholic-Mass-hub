"use client";

export type AppLocale = "en" | "es";

/** Detect Spanish from spoken/typed text (accents + common words). */
export function detectLocale(text: string): AppLocale {
  const t = text.toLowerCase();
  if (
    /[áéíóúñ¿¡]/.test(t) ||
    /\b(misa|misas|iglesia|parroquia|lecturas|hoy|busca|buscar|cerca|dónde|donde|enseñanza|catecismo|peregrinación|peregrinacion|en\s+línea|en\s+linea|español|gracias|por\s+favor)\b/.test(
      t,
    )
  ) {
    return "es";
  }
  return "en";
}

export function speakText(text: string, locale: AppLocale = "en") {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = locale === "es" ? "es-US" : "en-US";
  utterance.rate = 1;
  utterance.pitch = 1;

  const voices = window.speechSynthesis.getVoices();
  const preferred =
    voices.find((v) =>
      locale === "es"
        ? v.lang.toLowerCase().startsWith("es")
        : v.lang.toLowerCase().startsWith("en"),
    ) ?? null;
  if (preferred) utterance.voice = preferred;

  window.speechSynthesis.speak(utterance);
}

/** Spoken summary after Find Mass results load. */
export function speakFindResultsSummary(options: {
  locale: AppLocale;
  count: number;
  closestName?: string;
  closestMiles?: number | null;
  placeLabel?: string;
}) {
  const { locale, count, closestName, closestMiles, placeLabel } = options;
  const where =
    placeLabel && placeLabel !== "Your current location"
      ? placeLabel.split(",")[0]?.trim()
      : null;

  if (locale === "es") {
    if (count === 0) {
      speakText(
        where
          ? `No encontré parroquias cerca de ${where}. Puedes ver Misas en línea.`
          : "No encontré parroquias cerca. Puedes ver Misas en línea.",
        "es",
      );
      return;
    }
    const miles =
      closestMiles != null && Number.isFinite(closestMiles)
        ? `, a unos ${closestMiles.toFixed(1)} millas`
        : "";
    speakText(
      `Encontré ${count} parroquia${count === 1 ? "" : "s"}${where ? ` cerca de ${where}` : ""}. La más cercana es ${closestName ?? "una parroquia local"}${miles}.`,
      "es",
    );
    return;
  }

  if (count === 0) {
    speakText(
      where
        ? `I couldn't find parishes near ${where}. You can watch Mass online instead.`
        : "I couldn't find nearby parishes. You can watch Mass online instead.",
      "en",
    );
    return;
  }

  const miles =
    closestMiles != null && Number.isFinite(closestMiles)
      ? `, about ${closestMiles.toFixed(1)} miles away`
      : "";
  speakText(
    `I found ${count} parish${count === 1 ? "" : "es"}${where ? ` near ${where}` : ""}. The closest one to you is ${closestName ?? "a local parish"}${miles}.`,
    "en",
  );
}

/** Warm voices list (Chrome loads async). */
export function preloadSpeechVoices() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}
