import Link from "next/link";
import { ExternalLink, Radio, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero } from "@/components/layout/page-hero";
import { prisma } from "@/lib/db";
import streamsFallback from "@/data/online-streams.json";

export const metadata = { title: "Watch Online" };
export const revalidate = 3600; // refresh from DB hourly

export default async function WatchPage() {
  let streams = await prisma.onlineStream
    .findMany({ orderBy: { name: "asc" } })
    .catch(() => []);

  if (streams.length === 0) {
    streams = streamsFallback.map((s, i) => ({
      ...s,
      id: `fallback-${i}`,
      verifiedAt: new Date(),
      createdAt: new Date(),
      scheduleSummary: s.scheduleSummary ?? null,
      region: s.region ?? null,
      lastCheckOk: true,
      lastCheckedAt: new Date(),
    }));
  }

  const latest = streams.reduce<Date | null>((acc, s) => {
    const d = s.verifiedAt ? new Date(s.verifiedAt) : null;
    if (!d) return acc;
    if (!acc || d > acc) return d;
    return acc;
  }, null);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-10">
      <PageHero
        eyebrow="Live & on demand"
        title="Watch Mass Online"
        description="Trusted Catholic live streams when you cannot attend in person. Directory is refreshed from our curated database — re-seed anytime to update listings."
      />

      {latest && (
        <p className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="h-3.5 w-3.5 text-primary" aria-hidden />
          Directory last verified{" "}
          {latest.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          . Always confirm times on the broadcaster’s site.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {streams.map((stream) => (
          <Card key={stream.id} className="church-panel">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="font-heading text-xl font-normal">
                  {stream.name}
                </CardTitle>
                <div className="flex flex-wrap gap-1">
                  {stream.type === "live_mass" && (
                    <Badge className="gap-1 bg-primary text-primary-foreground">
                      <Radio className="h-3 w-3" />
                      Live
                    </Badge>
                  )}
                  {"lastCheckOk" in stream && stream.lastCheckOk === false && (
                    <Badge variant="destructive">Link issue</Badge>
                  )}
                </div>
              </div>
              <CardDescription>{stream.scheduleSummary}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-accent/40">
                {stream.language}
              </Badge>
              {stream.region && (
                <Badge variant="outline" className="border-accent/40">
                  {stream.region}
                </Badge>
              )}
              <Button
                className="mt-2 w-full sm:w-auto"
                render={<a href={stream.url} target="_blank" rel="noopener noreferrer" />}
              >
                Watch
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="church-panel mt-8 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Keeping this list current</p>
        <p className="mt-1">
          Edit <code className="text-xs">content/seeds/online-streams.json</code>, then run{" "}
          <code className="text-xs">npm run db:seed</code>. The page reloads from the database
          (hourly cache).
        </p>
      </div>

      <Button variant="link" className="mt-4 px-0 text-primary" render={<Link href="/find" />}>
        ← Back to Find Mass
      </Button>
    </div>
  );
}
