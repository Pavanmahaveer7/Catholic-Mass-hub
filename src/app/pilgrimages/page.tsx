import Link from "next/link";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero } from "@/components/layout/page-hero";
import { prisma } from "@/lib/db";

export const metadata = { title: "Pilgrimages" };
export const revalidate = 3600;

export default async function PilgrimagesPage() {
  let sites = await prisma.pilgrimageSite.findMany({
    orderBy: { name: "asc" },
  }).catch(() => []);

  if (sites.length === 0) {
    const fallback = (await import("@/../content/seeds/pilgrimages.json")).default;
    sites = fallback.map((s) => ({
      ...s,
      id: s.slug,
      peakEvents: JSON.stringify(s.peakEvents),
      howToReach: JSON.stringify(s.howToReach),
      yearlySchedule: JSON.stringify(
        "yearlySchedule" in s ? (s as { yearlySchedule?: unknown }).yearlySchedule ?? [] : [],
      ),
      images: "[]",
      lastVerifiedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      processionTimes: s.processionTimes ?? null,
      massScheduleNotes: s.massScheduleNotes ?? null,
      significance: s.significance ?? null,
      region: s.region ?? null,
      livestreamUrl: s.livestreamUrl ?? null,
      officialUrl: s.officialUrl ?? null,
    }));
  }

  const latest = sites.reduce<Date | null>((acc, s) => {
    const d = s.lastVerifiedAt ? new Date(s.lastVerifiedAt) : null;
    if (!d) return acc;
    if (!acc || d > acc) return d;
    return acc;
  }, null);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-10">
      <PageHero
        eyebrow="Sacred journeys"
        title="Catholic Pilgrimages"
        description="Major shrines worldwide — full-year feast calendars, travel notes, and when to visit. Re-seed the database anytime to refresh schedules."
      />
      {latest && (
        <p className="mb-6 text-sm text-muted-foreground">
          Calendars last verified{" "}
          {latest.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          . Confirm feast dates on each shrine’s official site.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {sites.map((site) => (
          <Card key={site.slug} className="church-panel">
            <CardHeader>
              <CardTitle className="font-heading text-xl font-normal">{site.name}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-primary" />
                {site.region ? `${site.region}, ` : ""}
                {site.country}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="line-clamp-3 text-sm text-muted-foreground">{site.description}</p>
              {site.bestSeason && (
                <Badge variant="outline" className="border-accent/50 bg-accent/10">
                  {site.bestSeason}
                </Badge>
              )}
              <Button render={<Link href={`/pilgrimages/${site.slug}`} />}>
                View guide
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
