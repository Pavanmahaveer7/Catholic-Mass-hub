"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero } from "@/components/layout/page-hero";

type Place = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  addressCity: string | null;
  addressRegion: string | null;
  featured: boolean;
  approvedAt: string | null;
};

const categoryLabels: Record<string, string> = {
  restaurant: "Restaurant",
  pub: "Pub",
  cafe: "Café",
  bookstore: "Bookstore",
  gift_shop: "Gift Shop",
  hangout: "Hangout",
  other: "Other",
};

export default function PlacesPage() {
  const [places, setPlaces] = useState<Place[]>([]);

  useEffect(() => {
    fetch("/api/places?status=approved")
      .then((r) => r.json())
      .then((d) => setPlaces(d.places ?? []));
  }, []);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const isNewThisMonth = (place: Place) => {
    if (!place.approvedAt) return false;
    return new Date(place.approvedAt) >= monthStart;
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-10">
      <PageHero
        eyebrow="Community"
        title="Local Catholic Spots"
        description="Catholic-owned and themed restaurants, pubs, cafés, and hangouts — gather after Mass with fellow faithful."
        actions={
          <Button render={<Link href="/places/submit" />}>
            <Plus className="mr-2 h-4 w-4" />
            List your business
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {places.length === 0 && (
          <Card className="church-panel sm:col-span-2">
            <CardContent className="py-10 text-center text-muted-foreground">
              No approved listings yet. Be the first to register your Catholic business.
            </CardContent>
          </Card>
        )}
        {places.map((place) => (
          <Card key={place.id} className="church-panel">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="border border-accent/30 bg-accent/15">
                  {categoryLabels[place.category] ?? place.category}
                </Badge>
                {place.featured && <Badge className="bg-primary">Featured</Badge>}
                {isNewThisMonth(place) && (
                  <Badge className="bg-[var(--marian)] text-[var(--marian-foreground)]">
                    New this month
                  </Badge>
                )}
              </div>
              <CardTitle className="font-heading text-xl font-normal">{place.name}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-primary" />
                {[place.addressCity, place.addressRegion].filter(Boolean).join(", ")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-3 text-sm text-muted-foreground">{place.description}</p>
              <Button
                className="mt-4"
                variant="outline"
                render={<Link href={`/places/${place.slug}`} />}
              >
                View details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
