"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Site = {
  id: string;
  slug: string;
  name: string;
  country: string;
  region: string | null;
  latitude: number;
  longitude: number;
  description: string;
  significance: string | null;
  bestSeason: string | null;
  peakEvents: string;
  yearlySchedule: string;
  massScheduleNotes: string | null;
  processionTimes: string | null;
  howToReach: string;
  officialUrl: string | null;
  livestreamUrl: string | null;
  lastVerifiedAt: string;
};

export default function AdminPilgrimagesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [latitude, setLatitude] = useState("0");
  const [longitude, setLongitude] = useState("0");
  const [description, setDescription] = useState("");
  const [bestSeason, setBestSeason] = useState("");
  const [yearlySchedule, setYearlySchedule] = useState("[]");
  const [peakEvents, setPeakEvents] = useState("[]");
  const [officialUrl, setOfficialUrl] = useState("");

  const load = () => {
    fetch("/api/admin/pilgrimages")
      .then((r) => r.json())
      .then((d) => setSites(d.sites ?? []))
      .catch(() => toast.error("Failed to load"));
  };

  useEffect(load, []);

  const loadSite = (s: Site) => {
    setSlug(s.slug);
    setName(s.name);
    setCountry(s.country);
    setRegion(s.region ?? "");
    setLatitude(String(s.latitude));
    setLongitude(String(s.longitude));
    setDescription(s.description);
    setBestSeason(s.bestSeason ?? "");
    setYearlySchedule(
      JSON.stringify(JSON.parse(s.yearlySchedule || "[]"), null, 2),
    );
    setPeakEvents(JSON.stringify(JSON.parse(s.peakEvents || "[]"), null, 2));
    setOfficialUrl(s.officialUrl ?? "");
  };

  const save = async () => {
    let schedule: unknown[] = [];
    let peaks: string[] = [];
    try {
      schedule = JSON.parse(yearlySchedule) as unknown[];
      peaks = JSON.parse(peakEvents) as string[];
    } catch {
      toast.error("yearlySchedule and peakEvents must be valid JSON");
      return;
    }

    const res = await fetch("/api/admin/pilgrimages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        name,
        country,
        region: region || null,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        description,
        bestSeason: bestSeason || null,
        yearlySchedule: schedule,
        peakEvents: peaks,
        officialUrl: officialUrl || null,
      }),
    });
    if (!res.ok) {
      toast.error("Save failed");
      return;
    }
    toast.success("Pilgrimage saved · lastVerified updated");
    load();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-heading text-3xl">Admin · Pilgrimages</h1>
        <div className="flex gap-2">
          <Button variant="outline" render={<Link href="/admin/streams" />}>
            Streams
          </Button>
          <Button variant="outline" render={<Link href="/admin/places" />}>
            Places
          </Button>
        </div>
      </div>

      <Card className="church-panel">
        <CardHeader>
          <CardTitle className="font-heading font-normal">
            Edit / create site
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Slug</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Country</Label>
            <Input value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
          <div>
            <Label>Region</Label>
            <Input value={region} onChange={(e) => setRegion(e.target.value)} />
          </div>
          <div>
            <Label>Latitude</Label>
            <Input value={latitude} onChange={(e) => setLatitude(e.target.value)} />
          </div>
          <div>
            <Label>Longitude</Label>
            <Input value={longitude} onChange={(e) => setLongitude(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Best season</Label>
            <Input value={bestSeason} onChange={(e) => setBestSeason(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Official URL</Label>
            <Input value={officialUrl} onChange={(e) => setOfficialUrl(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Peak events (JSON array)</Label>
            <Textarea
              value={peakEvents}
              onChange={(e) => setPeakEvents(e.target.value)}
              rows={3}
              className="font-mono text-xs"
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Yearly schedule (JSON array)</Label>
            <Textarea
              value={yearlySchedule}
              onChange={(e) => setYearlySchedule(e.target.value)}
              rows={10}
              className="font-mono text-xs"
            />
          </div>
          <Button className="sm:col-span-2" onClick={() => void save()}>
            Save & mark verified
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h2 className="font-heading text-xl">Existing sites</h2>
        {sites.map((s) => (
          <Card key={s.id} className="church-panel">
            <CardContent className="flex items-center justify-between gap-2 py-3">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-muted-foreground">
                  {s.slug} · verified{" "}
                  {new Date(s.lastVerifiedAt).toLocaleDateString()}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => loadSite(s)}>
                Edit
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
