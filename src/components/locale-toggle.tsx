"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n";

export function LocaleToggle() {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    fetch("/api/locale")
      .then((r) => r.json())
      .then((d) => setLocale(d.locale === "es" ? "es" : "en"))
      .catch(() => undefined);
  }, []);

  async function toggle() {
    const next: Locale = locale === "en" ? "es" : "en";
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: next }),
    });
    setLocale(next);
    router.refresh();
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-9 min-w-9 px-2 font-semibold"
      onClick={() => void toggle()}
      aria-label={locale === "en" ? "Switch to Spanish" : "Switch to English"}
      title={locale === "en" ? "Español" : "English"}
    >
      {locale === "en" ? "ES" : "EN"}
    </Button>
  );
}
