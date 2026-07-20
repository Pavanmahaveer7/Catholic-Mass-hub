import Link from "next/link";
import { ExternalLink, Radio, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero } from "@/components/layout/page-hero";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";
import streamsFallback from "@/data/online-streams.json";

export const metadata = { title: "Watch Online" };
export const revalidate = 3600;

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
        description="Trusted Catholic live streams when you cannot attend in person. Links open on the broadcaster’s site in a new tab."
      />

      {latest && (
        <p className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="h-3.5 w-3.5 text-primary" aria-hidden />
          Directory last refreshed{" "}
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
              {/* Native <a> — more reliable than Button render for external sites */}
              <a
                href={stream.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants(), "mt-2 w-full sm:w-auto")}
              >
                Open stream
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
              <p className="w-full break-all text-xs text-muted-foreground">{stream.url}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="church-panel mt-8 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">If a link will not open</p>
        <p className="mt-1">
          Some shrines block automated checks or certain regions. Copy the URL shown under each
          button, or try EWTN / YouTube alternatives. Confirm schedules on the official site.
        </p>
      </div>

      <Button variant="link" className="mt-4 px-0 text-primary" render={<Link href="/find" />}>
        ← Back to Find Mass
      </Button>
    </div>
  );
}
