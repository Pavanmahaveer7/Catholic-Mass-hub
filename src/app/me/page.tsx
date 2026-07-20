"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Phone, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero } from "@/components/layout/page-hero";

type Favorite = {
  id: string;
  churchId: string;
  name: string;
  address: string | null;
  city: string | null;
  region: string | null;
  phone: string | null;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
};

export default function MyParishesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [authed, setAuthed] = useState<boolean | null>(null);

  const load = () => {
    fetch("/api/favorites")
      .then(async (r) => {
        if (r.status === 401) {
          setAuthed(false);
          return { favorites: [] };
        }
        setAuthed(true);
        return r.json();
      })
      .then((d) => setFavorites(d.favorites ?? []))
      .catch(() => setAuthed(false));
  };

  useEffect(load, []);

  const remove = async (churchId: string) => {
    const res = await fetch("/api/favorites", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ churchId }),
    });
    if (res.ok) {
      toast.success("Removed");
      load();
    }
  };

  if (authed === false) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-heading text-3xl">My parishes</h1>
        <p className="mt-2 text-muted-foreground">
          Sign in to save parishes from Find Mass.
        </p>
        <Button className="mt-6" render={<Link href="/login?next=/me" />}>
          Sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <PageHero
        eyebrow="Account"
        title="My parishes"
        description="Parishes you saved from Find Mass — quick access to your home parish and favorites."
      />
      <div className="space-y-3">
        {favorites.length === 0 && (
          <Card className="church-panel">
            <CardContent className="py-10 text-center text-muted-foreground">
              No saved parishes yet.{" "}
              <Link href="/find" className="text-primary underline">
                Find Mass
              </Link>{" "}
              and tap Save parish.
            </CardContent>
          </Card>
        )}
        {favorites.map((f) => (
          <Card key={f.id} className="church-panel">
            <CardHeader className="pb-2">
              <CardTitle className="font-heading text-xl font-normal">{f.name}</CardTitle>
              {(f.address || f.city) && (
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {[f.address, f.city, f.region].filter(Boolean).join(", ")}
                </p>
              )}
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {f.latitude != null && f.longitude != null && (
                <Button
                  size="sm"
                  render={
                    <Link
                      href={`/find?lat=${f.latitude}&lng=${f.longitude}&q=${encodeURIComponent(f.name)}`}
                    />
                  }
                >
                  Open in Find Mass
                </Button>
              )}
              {f.phone && (
                <Button size="sm" variant="outline" render={<a href={`tel:${f.phone}`} />}>
                  <Phone className="mr-1 h-3 w-3" />
                  Call
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => void remove(f.churchId)}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Remove
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
