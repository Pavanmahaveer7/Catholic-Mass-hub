import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, BookOpen, Cross, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HomePrayersStrip } from "@/components/home-prayers-strip";
import { PapalBlessing } from "@/components/papal-blessing";
import { mainNav } from "@/lib/navigation";
import { fetchDailyReadings } from "@/lib/usccb-readings";
import { getTeachingOfTheDay } from "@/lib/teaching-of-day";
import { LOCALE_COOKIE, t, type Locale } from "@/lib/i18n";
import { getSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSession();
  const jar = await cookies();
  const locale: Locale =
    session?.locale ??
    (jar.get(LOCALE_COOKIE)?.value === "es" ? "es" : "en");
  const c = t(locale);

  let gospelTeaser = locale === "es" ? "Lecturas de hoy (USCCB)" : "Today's readings from the USCCB";
  let liturgicalTitle = locale === "es" ? "Liturgia del día" : "Liturgy of the Day";
  try {
    const readings = await fetchDailyReadings();
    liturgicalTitle = readings.liturgicalTitle || liturgicalTitle;
    const gospel = readings.readings.find((r) => /gospel/i.test(r.title));
    gospelTeaser = gospel?.citation
      ? `${locale === "es" ? "Evangelio" : "Gospel"}: ${gospel.citation}`
      : readings.liturgicalTitle;
  } catch {
    // fallback teaser
  }

  const teaching = await getTeachingOfTheDay();

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-accent/10 to-transparent"
      />
      <div className="relative mx-auto max-w-6xl px-4 py-10 md:py-16">
        <PapalBlessing locale={locale} />

        <section className="mb-14 md:mb-16">
          <div className="mb-5 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/50 bg-accent/20 text-primary">
              <Cross className="h-4 w-4" aria-hidden />
            </span>
            <Badge
              variant="secondary"
              className="border border-accent/40 bg-accent/15 text-accent-foreground"
            >
              Roman Catholic · Mass · Readings · Pilgrimage
            </Badge>
          </div>
          <h1 className="font-heading max-w-3xl text-4xl font-normal tracking-tight md:text-6xl md:leading-[1.1]">
            {c.brand}
          </h1>
          <p className="mt-3 max-w-xl font-heading text-2xl text-primary md:text-3xl">
            {c.tagline}
          </p>
          <div className="church-rule my-6 max-w-sm" aria-hidden />
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {c.heroBody}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button size="lg" className="shadow-md shadow-primary/20" render={<Link href="/find?locate=1" />}>
              {c.findMass}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="hidden border-accent/50 sm:inline-flex"
              render={<Link href="/readings" />}
            >
              {c.todaysReadings}
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="hidden gap-2 sm:inline-flex"
              render={<Link href="/find" />}
            >
              <Mic className="h-4 w-4" />
              {c.askVoice}
            </Button>
          </div>
          <div className="mt-3 flex gap-3 sm:hidden">
            <Button variant="outline" className="flex-1 border-accent/50" render={<Link href="/readings" />}>
              {c.todaysReadings}
            </Button>
            <Button variant="ghost" className="gap-1" render={<Link href="/guides/new-to-mass" />}>
              New to Mass?
            </Button>
          </div>
        </section>

        <Link href="/readings" className="group mb-8 block">
          <div className="church-panel overflow-hidden border-l-4 border-l-accent p-6 transition group-hover:border-primary/30">
            <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
              {c.todaysGospel}
            </p>
            <p className="mt-1 font-heading text-xl text-muted-foreground md:text-2xl">
              {liturgicalTitle}
            </p>
            <p className="mt-2 text-base text-foreground">{gospelTeaser}</p>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-primary">
              {c.readFull}
              <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>

        {teaching && (
          <Link href={`/teachings/${teaching.sectionSlug}`} className="group mb-8 block">
            <div className="church-panel overflow-hidden border-l-4 border-l-primary p-6 transition group-hover:border-accent/40">
              <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-primary uppercase">
                <BookOpen className="h-3.5 w-3.5" />
                {c.teachingOfDay}
              </p>
              <p className="mt-1 font-heading text-xl md:text-2xl">{teaching.chapter}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {teaching.sectionTitle} · {teaching.source}
              </p>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-primary">
                Continue reading
                <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        )}

        <HomePrayersStrip />

        <section aria-labelledby="modules-heading">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 id="modules-heading" className="font-heading text-2xl md:text-3xl">
                {c.explore}
              </h2>
              <div className="church-rule mt-3 max-w-[8rem]" aria-hidden />
            </div>
            <Button variant="link" className="text-primary" render={<Link href="/about" />}>
              {c.about}
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mainNav.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="group">
                  <Card className="church-panel h-full border-transparent transition-all group-hover:-translate-y-0.5 group-hover:border-accent/40">
                    <CardHeader>
                      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-accent/30">
                        <Icon className="h-5 w-5" aria-hidden />
                      </div>
                      <CardTitle className="flex items-center justify-between font-heading text-xl font-normal">
                        {item.title}
                        <ArrowRight className="h-4 w-4 text-accent opacity-0 transition-opacity group-hover:opacity-100" />
                      </CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
