"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DailyReadings } from "@/lib/usccb-readings";

export default function ReadingsPage() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<DailyReadings | null>(null);
  const [loading, setLoading] = useState(true);

  const updateDate = (newDate: string) => {
    setLoading(true);
    setDate(newDate);
  };

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/readings?date=${date}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setData(d); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [date]);

  const shiftDate = (days: number) => {
    const d = new Date(`${date}T12:00:00`);
    d.setDate(d.getDate() + days);
    updateDate(d.toISOString().slice(0, 10));
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge
            variant="secondary"
            className="mb-3 border border-accent/40 bg-accent/15 text-accent-foreground"
          >
            Word of God
          </Badge>
          <h1 className="font-heading text-3xl md:text-4xl">Daily Readings</h1>
          <div className="church-rule my-3 max-w-[8rem]" aria-hidden />
          <p className="text-muted-foreground">Official USCCB readings for the liturgy of the day.</p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={() => shiftDate(-1)} aria-label="Previous day">
            <ChevronLeft />
          </Button>
          <input
            type="date"
            value={date}
            onChange={(e) => updateDate(e.target.value)}
            className="rounded-md border border-accent/30 bg-card px-2 py-1 text-sm"
            aria-label="Select date"
          />
          <Button variant="outline" size="icon" onClick={() => shiftDate(1)} aria-label="Next day">
            <ChevronRight />
          </Button>
        </div>
      </div>

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {!loading && data && (
        <>
          <div className="mb-6">
            <Badge variant="secondary" className="mb-2 border border-accent/40 bg-accent/15">
              {data.lectionary ? `Lectionary ${data.lectionary}` : "USCCB"}
            </Badge>
            <h2 className="font-heading text-2xl">{data.liturgicalTitle}</h2>
          </div>

          <div className="space-y-4">
            {data.readings.map((reading) => (
              <Card key={reading.title} className="church-panel border-l-4 border-l-primary/40">
                <CardHeader>
                  <CardTitle className="font-heading text-xl font-normal">
                    {reading.title}
                  </CardTitle>
                  {reading.citation && (
                    <p className="text-sm font-medium text-primary">{reading.citation}</p>
                  )}
                </CardHeader>
                {reading.text && (
                  <CardContent>
                    <p className="leading-relaxed text-muted-foreground">{reading.text}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          <div className="church-panel mt-8 p-4 text-sm">
            <p className="mb-3">
              Scripture texts from the Lectionary for Mass for Use in the Dioceses of the
              United States, copyright © USCCB. For the full official text, visit USCCB.
            </p>
            <Button render={<a href={data.url} target="_blank" rel="noopener noreferrer" />}>
              Read full text on USCCB
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="link" className="ml-2" render={<Link href="https://bible.usccb.org/?lang=es" target="_blank" />}>
              En Español
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
