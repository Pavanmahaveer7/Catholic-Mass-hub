"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

type Stream = {
  id: string;
  name: string;
  url: string;
  language: string;
  timezone: string;
  scheduleSummary: string | null;
  type: string;
  region: string | null;
  lastCheckOk: boolean;
  verifiedAt: string;
};

const empty = {
  name: "",
  url: "",
  language: "English",
  timezone: "America/New_York",
  scheduleSummary: "",
  type: "live_mass",
  region: "",
};

export default function AdminStreamsPage() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = () => {
    fetch("/api/admin/streams")
      .then((r) => r.json())
      .then((d) => setStreams(d.streams ?? []))
      .catch(() => toast.error("Failed to load streams"));
  };

  useEffect(load, []);

  const save = async () => {
    const res = await fetch("/api/admin/streams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingId ?? undefined,
        ...form,
        scheduleSummary: form.scheduleSummary || null,
        region: form.region || null,
      }),
    });
    if (!res.ok) {
      toast.error("Save failed");
      return;
    }
    toast.success(editingId ? "Stream updated" : "Stream added");
    setForm(empty);
    setEditingId(null);
    load();
  };

  const remove = async (id: string) => {
    const res = await fetch("/api/admin/streams", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      toast.success("Deleted");
      load();
    } else toast.error("Delete failed");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-heading text-3xl">Admin · Watch Online</h1>
        <div className="flex gap-2">
          <Button variant="outline" render={<Link href="/admin/pilgrimages" />}>
            Pilgrimages
          </Button>
          <Button variant="outline" render={<Link href="/admin/places" />}>
            Places
          </Button>
        </div>
      </div>

      <Card className="church-panel">
        <CardHeader>
          <CardTitle className="font-heading font-normal">
            {editingId ? "Edit stream" : "Add stream"}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="language">Language</Label>
            <Input
              id="language"
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="region">Region</Label>
            <Input
              id="region"
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="schedule">Schedule summary</Label>
            <Textarea
              id="schedule"
              value={form.scheduleSummary}
              onChange={(e) => setForm({ ...form, scheduleSummary: e.target.value })}
            />
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <Button onClick={() => void save()}>Save</Button>
            {editingId && (
              <Button
                variant="ghost"
                onClick={() => {
                  setEditingId(null);
                  setForm(empty);
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {streams.map((s) => (
          <Card key={s.id} className="church-panel">
            <CardContent className="flex flex-wrap items-start justify-between gap-3 py-4">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-muted-foreground">{s.scheduleSummary}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="outline">{s.language}</Badge>
                  {s.region && <Badge variant="outline">{s.region}</Badge>}
                  <Badge variant={s.lastCheckOk ? "secondary" : "destructive"}>
                    {s.lastCheckOk ? "Link OK" : "Link issue"}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingId(s.id);
                    setForm({
                      name: s.name,
                      url: s.url,
                      language: s.language,
                      timezone: s.timezone,
                      scheduleSummary: s.scheduleSummary ?? "",
                      type: s.type,
                      region: s.region ?? "",
                    });
                  }}
                >
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => void remove(s.id)}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
