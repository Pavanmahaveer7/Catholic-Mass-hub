"use client";

import { Heart, ExternalLink, MonitorPlay, Phone } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Church } from "@/lib/masstimes";
import { formatTime, groupWorshipTimes, matchesServiceFilter } from "@/lib/worship-times";

type ParishCardProps = {
  church: Church;
  index: number;
  selected?: boolean;
  onSelect?: () => void;
};

export function ParishCard({
  church,
  index,
  selected,
  onSelect,
}: ParishCardProps) {
  const groups = groupWorshipTimes(church.church_worship_times);
  const hasConfession = church.church_worship_times.some((wt) =>
    matchesServiceFilter(wt, "confession"),
  );
  const hasAdoration = church.church_worship_times.some((wt) =>
    matchesServiceFilter(wt, "adoration"),
  );
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/favorites")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled || !d?.favorites) return;
        setSaved(
          (d.favorites as { churchId: string }[]).some(
            (f) => String(f.churchId) === String(church.id),
          ),
        );
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [church.id]);

  async function toggleSave(e: React.MouseEvent) {
    e.stopPropagation();
    setSaving(true);
    try {
      if (saved) {
        const res = await fetch("/api/favorites", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ churchId: String(church.id) }),
        });
        if (res.status === 401) {
          toast.message("Sign in to manage saved parishes");
          return;
        }
        if (res.ok) {
          setSaved(false);
          toast.success("Removed from My parishes");
        }
      } else {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            churchId: String(church.id),
            name: church.name,
            address: church.church_address_street_address,
            city: church.church_address_city_name,
            region: church.church_address_providence_name,
            latitude: parseFloat(church.latitude) || null,
            longitude: parseFloat(church.longitude) || null,
            phone: church.phone_number || null,
            website: church.url || null,
          }),
        });
        if (res.status === 401) {
          toast.message("Sign in to save a parish", {
            action: {
              label: "Sign in",
              onClick: () => {
                window.location.href = "/login?next=/find";
              },
            },
          });
          return;
        }
        if (res.ok) {
          setSaved(true);
          toast.success("Saved to My parishes");
        } else {
          toast.error("Could not save parish");
        }
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card
      className={selected ? "border-primary ring-2 ring-primary/20" : undefined}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Badge variant="outline" className="mb-2">
              #{index + 1}
              {church.distance
                ? ` · ${parseFloat(church.distance).toFixed(1)} mi`
                : ""}
            </Badge>
            <CardTitle className="text-lg">{church.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {church.church_address_street_address},{" "}
              {church.church_address_city_name},{" "}
              {church.church_address_providence_name}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {church.rite_type_name && (
            <Badge variant="secondary">{church.rite_type_name}</Badge>
          )}
          {church.language_name?.trim() && (
            <Badge variant="secondary">{church.language_name.trim()}</Badge>
          )}
          {hasConfession && (
            <Badge className="bg-primary/90 text-primary-foreground">Confession</Badge>
          )}
          {hasAdoration && (
            <Badge className="bg-[var(--marian)] text-[var(--marian-foreground)]">
              Adoration
            </Badge>
          )}
        </div>

        <Collapsible>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium hover:underline">
            Mass & worship times
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-3 pb-3 text-sm">
              {Object.entries(groups).map(([day, times]) => (
                <div key={day}>
                  <p className="font-medium">{day}</p>
                  <ul className="mt-1 space-y-1 text-muted-foreground">
                    {times.map((wt) => {
                      const language = wt.language?.trim();
                      return (
                        <li key={wt.id}>
                          {wt.service_typename ?? "Service"} ·{" "}
                          {formatTime(wt.time_start)}
                          {language ? ` · ${language}` : ""}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={saved ? "secondary" : "outline"}
            size="sm"
            disabled={saving}
            onClick={(e) => void toggleSave(e)}
          >
            <Heart
              className={`mr-1 h-3 w-3 ${saved ? "fill-current text-primary" : ""}`}
            />
            {saved ? "Saved" : "Save parish"}
          </Button>
          {church.phone_number && (
            <Button variant="outline" size="sm" render={<a href={`tel:${church.phone_number}`} />}>
              <Phone className="mr-1 h-3 w-3" />
              Call
            </Button>
          )}
          {church.url && (
            <Button
              variant="outline"
              size="sm"
              render={
                <a
                  href={church.url.startsWith("http") ? church.url : `https://${church.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <ExternalLink className="mr-1 h-3 w-3" />
              Website
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Updated {church.last_update?.split(" ")[0] ?? "unknown"} · Data via{" "}
          <a
            href="https://masstimes.org/"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            MassTimes.org
          </a>
          . Filter for Confession or Adoration above when listed.
        </p>
      </CardContent>
    </Card>
  );
}

export function OnlineMassFallback() {
  return (
    <Card className="border-accent/40 bg-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MonitorPlay className="h-5 w-5 text-accent-foreground" />
          No nearby Mass? Watch online
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          When travel, illness, or distance keeps you from a parish, these trusted
          Catholic streams can help you pray with the Church.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button render={<Link href="/watch" />}>Browse live streams</Button>
          <Button variant="outline" render={<a href="https://www.ewtn.com/tv/watch-live/" target="_blank" rel="noopener noreferrer" />}>
            EWTN Live
          </Button>
          <Button variant="outline" render={<a href="https://bible.usccb.org/daily-bible-reading" target="_blank" rel="noopener noreferrer" />}>
            Daily Readings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
