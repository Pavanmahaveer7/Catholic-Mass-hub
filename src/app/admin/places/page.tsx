"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Place = {
  id: string;
  name: string;
  category: string;
  addressCity: string | null;
  status: string;
};

export default function AdminPlacesPage() {
  const [places, setPlaces] = useState<Place[]>([]);

  const load = () => {
    fetch("/api/admin/places")
      .then((r) => r.json())
      .then((d) => setPlaces(d.places ?? []));
  };

  useEffect(load, []);

  const review = async (id: string, status: "approved" | "rejected") => {
    const res = await fetch("/api/admin/places", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      toast.success(`Listing ${status}`);
      load();
    } else {
      toast.error("Review failed");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-heading text-3xl">Admin — Place Review</h1>
        <div className="flex gap-2">
          <Button variant="outline" render={<Link href="/admin/streams" />}>
            Streams
          </Button>
          <Button variant="outline" render={<Link href="/admin/pilgrimages" />}>
            Pilgrimages
          </Button>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Approve or reject pending business submissions.
      </p>
      <div className="mt-6 space-y-3">
        {places.length === 0 && (
          <p className="text-muted-foreground">No pending submissions.</p>
        )}
        {places.map((place) => (
          <Card key={place.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">{place.name}</CardTitle>
                <Badge variant="outline" className="mt-1">{place.category}</Badge>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => review(place.id, "approved")}>Approve</Button>
                <Button size="sm" variant="outline" onClick={() => review(place.id, "rejected")}>Reject</Button>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {place.addressCity}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
