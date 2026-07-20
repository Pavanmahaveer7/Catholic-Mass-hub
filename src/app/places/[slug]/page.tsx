import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = { params: Promise<{ slug: string }> };

export default async function PlaceDetailPage({ params }: Props) {
  const { slug } = await params;
  const place = await prisma.localPlace.findUnique({ where: { slug } }).catch(() => null);

  if (!place) {
    return (
      <div className="p-8 text-center">
        <p>Listing not found.</p>
        <Button className="mt-4" render={<Link href="/places" />}>Back</Button>
      </div>
    );
  }

  const amenities = JSON.parse(place.amenities) as string[];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Button variant="link" className="px-0" render={<Link href="/places" />}>
        ← All local spots
      </Button>
      <Badge className="mb-2 mt-4">{place.category}</Badge>
      <h1 className="font-heading text-3xl">{place.name}</h1>
      <p className="mt-4 text-muted-foreground">{place.description}</p>
      <Card className="mt-6">
        <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {place.addressStreet && <p>{place.addressStreet}</p>}
          <p>{[place.addressCity, place.addressRegion, place.addressPostal].filter(Boolean).join(", ")}</p>
          {place.phone && <p>Phone: {place.phone}</p>}
          {place.website && (
            <a href={place.website} className="text-primary underline" target="_blank" rel="noopener noreferrer">
              Website
            </a>
          )}
        </CardContent>
      </Card>
      {amenities.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {amenities.map((a) => (
            <Badge key={a} variant="outline">{a.replace(/_/g, " ")}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}
