"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import papal from "@/../content/seeds/papal-message.json";
import { VaticanFlag } from "@/components/vatican-flag";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";

type Props = { locale?: Locale };

export function PapalBlessing({ locale = "en" }: Props) {
  const es = locale === "es";
  const name = es ? papal.popeNameEs : papal.popeName;
  const title = es ? papal.titleEs : papal.title;
  const message = es ? papal.messageEs : papal.message;
  const note = es ? papal.sourceNoteEs : papal.sourceNote;
  const [src, setSrc] = useState(papal.imageSrc);

  return (
    <section
      aria-labelledby="papal-greeting-heading"
      className="relative mb-12 overflow-hidden rounded-xl border border-accent/40 bg-gradient-to-br from-[oklch(0.97_0.02_85)] via-background to-primary/[0.06] shadow-sm"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, transparent, transparent 12px, oklch(0.55 0.12 25 / 0.15) 12px, oklch(0.55 0.12 25 / 0.15) 13px)",
        }}
      />

      <div className="relative grid gap-6 p-5 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)] md:gap-8 md:p-8">
        <div className="flex flex-col items-center gap-4 md:items-start">
          <div className="flex w-full items-center justify-center gap-3 md:justify-start">
            <VaticanFlag className="h-14 w-[5.25rem] shrink-0 rounded-sm shadow-md ring-1 ring-black/10 md:h-16 md:w-24" />
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                {es ? "Santa Sede" : "Holy See"}
              </p>
              <p className="text-sm text-muted-foreground">
                {es ? "Ciudad del Vaticano" : "Vatican City"}
              </p>
            </div>
          </div>

          <div className="relative aspect-[3/4] w-full max-w-[16rem] overflow-hidden rounded-lg border border-accent/30 bg-muted shadow-md md:max-w-none">
            <Image
              src={src}
              alt={papal.imageAlt}
              fill
              priority
              unoptimized={src.endsWith(".svg")}
              className="object-cover object-top"
              sizes="(max-width: 768px) 256px, 320px"
              onError={() => setSrc(papal.imageFallback)}
            />
          </div>
          <p className="text-center text-[10px] text-muted-foreground md:text-left">
            {papal.imageCredit}
          </p>
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
            {es ? "Mensaje del Santo Padre" : "Message from the Holy Father"}
          </p>
          <h2
            id="papal-greeting-heading"
            className="mt-2 font-heading text-3xl font-normal text-foreground md:text-4xl"
          >
            {name}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{title}</p>
          <div className="church-rule my-4 max-w-[8rem]" aria-hidden />
          <blockquote className="font-heading text-xl leading-relaxed text-foreground/90 md:text-2xl md:leading-snug">
            “{message}”
          </blockquote>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{note}</p>
          <a
            href={papal.vaticanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "mt-5 w-fit border-accent/50",
            )}
          >
            {es ? "Visitar vatican.va" : "Visit vatican.va"}
          </a>
          <Link
            href="/about"
            className="mt-3 text-sm text-primary underline-offset-4 hover:underline"
          >
            {es ? "Acerca de este sitio" : "About this site"}
          </Link>
        </div>
      </div>
    </section>
  );
}
