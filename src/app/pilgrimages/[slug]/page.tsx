import Link from "next/link";
import { CalendarDays, ExternalLink, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { prisma } from "@/lib/db";
import pilgrimagesFallback from "@/../content/seeds/pilgrimages.json";
import {
  formatScheduleDate,
  getUpcomingEvents,
  groupScheduleByMonth,
  parseYearlySchedule,
  type ScheduleEvent,
} from "@/lib/pilgrimage-schedule";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 3600;

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const site = pilgrimagesFallback.find((s) => s.slug === slug);
  return { title: site?.name ?? "Pilgrimage" };
}

export default async function PilgrimageDetailPage({ params }: Props) {
  const { slug } = await params;
  const site = await prisma.pilgrimageSite.findUnique({ where: { slug } }).catch(() => null);
  const fallback = pilgrimagesFallback.find((s) => s.slug === slug);

  if (!site && !fallback) {
    return (
      <div className="p-8 text-center">
        <p>Pilgrimage site not found.</p>
        <Button className="mt-4" render={<Link href="/pilgrimages" />}>
          Back
        </Button>
      </div>
    );
  }

  const data = site ?? fallback!;
  const peakEvents = site
    ? (JSON.parse(site.peakEvents) as string[])
    : fallback!.peakEvents;
  const howToReach = site
    ? (JSON.parse(site.howToReach) as Record<string, string>)
    : fallback!.howToReach;

  const yearlyRaw =
    site?.yearlySchedule ??
    ("yearlySchedule" in (fallback ?? {})
      ? (fallback as { yearlySchedule?: ScheduleEvent[] }).yearlySchedule
      : []);
  const yearly = parseYearlySchedule(yearlyRaw ?? []);
  const byMonth = groupScheduleByMonth(yearly);
  const upcoming = getUpcomingEvents(yearly, 3);
  const verified =
    site?.lastVerifiedAt ??
    ("lastVerifiedAt" in data ? (data as { lastVerifiedAt?: Date }).lastVerifiedAt : undefined);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-10">
      <Button variant="link" className="mb-4 px-0 text-primary" render={<Link href="/pilgrimages" />}>
        ← All pilgrimages
      </Button>
      <h1 className="font-heading text-3xl md:text-4xl">{data.name}</h1>
      <p className="mt-1 text-muted-foreground">{data.country}</p>
      <div className="church-rule my-4 max-w-[10rem]" aria-hidden />
      {verified && (
        <p className="mb-4 text-xs text-muted-foreground">
          Schedule last verified{" "}
          {new Date(verified).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          . Confirm on the official site before travel.
        </p>
      )}

      <Tabs defaultValue="schedule" className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schedule">Yearly schedule</TabsTrigger>
          <TabsTrigger value="travel">Travel</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="church-panel">
            <CardHeader>
              <CardTitle className="font-heading font-normal">About</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">{data.description}</CardContent>
          </Card>
          {"significance" in data && data.significance && (
            <Card className="church-panel">
              <CardHeader>
                <CardTitle className="font-heading font-normal">Significance</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">{data.significance}</CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          {upcoming.length > 0 && (
            <Card className="church-panel border-l-4 border-l-accent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading text-lg font-normal">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  Coming up next
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcoming.map(({ event, date }) => (
                  <div key={`${event.month}-${event.day}-${event.title}`} className="text-sm">
                    <p className="font-medium text-foreground">{event.title}</p>
                    <p className="text-muted-foreground">
                      {date.toLocaleDateString(undefined, {
                        month: "long",
                        day: event.day ? "numeric" : undefined,
                        year: "numeric",
                      })}
                      {event.notes ? ` · ${event.notes}` : ""}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card className="church-panel">
            <CardHeader>
              <CardTitle className="font-heading font-normal">Best season</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{data.bestSeason}</p>
              {peakEvents?.length > 0 && (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {peakEvents.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {yearly.length > 0 ? (
            <div className="space-y-3">
              <h2 className="font-heading text-xl">Full year calendar</h2>
              {byMonth.map((m) =>
                m.events.length === 0 ? null : (
                  <Card key={m.month} className="church-panel">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold text-primary">
                        {m.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {m.events.map((event) => (
                        <div
                          key={`${m.month}-${event.day}-${event.title}`}
                          className="flex flex-wrap items-start justify-between gap-2 border-b border-border/60 pb-3 last:border-0 last:pb-0"
                        >
                          <div>
                            <p className="font-medium">{event.title}</p>
                            {event.notes && (
                              <p className="text-sm text-muted-foreground">{event.notes}</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant="outline" className="border-accent/40">
                              {formatScheduleDate(event)}
                            </Badge>
                            <Badge variant="secondary" className="capitalize">
                              {event.type}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ),
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Detailed yearly calendar will appear after the next content refresh (
              <code className="text-xs">npm run db:seed</code>).
            </p>
          )}

          {"massScheduleNotes" in data && data.massScheduleNotes && (
            <Card className="church-panel">
              <CardHeader>
                <CardTitle className="font-heading font-normal">Liturgical notes</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                {data.massScheduleNotes}
              </CardContent>
            </Card>
          )}
          {"processionTimes" in data && data.processionTimes && (
            <Card className="church-panel">
              <CardHeader>
                <CardTitle className="font-heading font-normal">Processions</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                {data.processionTimes}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="travel" className="space-y-4">
          <Card className="church-panel">
            <CardHeader>
              <CardTitle className="font-heading font-normal">How to reach</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {Object.entries(howToReach).map(([key, val]) => (
                <p key={key}>
                  <strong className="capitalize text-foreground">{key}:</strong> {val}
                </p>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex flex-wrap gap-2">
        {data.officialUrl && (
          <Button render={<a href={data.officialUrl} target="_blank" rel="noopener noreferrer" />}>
            Official site <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        )}
        {data.livestreamUrl && (
          <Button
            variant="outline"
            render={<a href={data.livestreamUrl} target="_blank" rel="noopener noreferrer" />}
          >
            <Radio className="mr-2 h-4 w-4" /> Live stream
          </Button>
        )}
        {yearly.length > 0 && (
          <Button variant="outline" render={<a href={`/api/pilgrimages/${slug}/ics`} />}>
            <CalendarDays className="mr-2 h-4 w-4" />
            Add to calendar (.ics)
          </Button>
        )}
      </div>
    </div>
  );
}
