"use client";

import { useState } from "react";
import Link from "next/link";
import { prayers } from "@/data/prayers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero } from "@/components/layout/page-hero";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PrayersPage() {
  const [locale, setLocale] = useState<"en" | "es">("en");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-10">
      <PageHero
        eyebrow="Devotion"
        title="Essential prayers"
        description="Common Catholic prayers you can pray anytime — no account needed. Switch to Spanish when you prefer."
      />
      <Tabs
        value={locale}
        onValueChange={(v) => setLocale(v === "es" ? "es" : "en")}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="en">English</TabsTrigger>
          <TabsTrigger value="es">Español</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="space-y-4">
        {prayers.map((p) => (
          <Card key={p.id} id={p.id} className="church-panel scroll-mt-24">
            <CardHeader>
              <CardTitle className="font-heading text-xl font-normal">
                {locale === "es" && p.titleEs ? p.titleEs : p.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted-foreground">
                {locale === "es" && p.textEs ? p.textEs : p.text}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-2">
        <Button variant="outline" render={<Link href="/guides/confession" />}>
          Going to Confession
        </Button>
        <Button variant="outline" render={<Link href="/guides/new-to-mass" />}>
          New to Mass?
        </Button>
      </div>
    </div>
  );
}
