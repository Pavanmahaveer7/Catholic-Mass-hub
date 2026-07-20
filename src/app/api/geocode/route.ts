import { NextRequest, NextResponse } from "next/server";

const GEOCODE_HEADERS = {
  "User-Agent": "CatholicMassHub/1.0",
  Accept: "application/json",
};

type GeocodeResult = {
  lat: number;
  lng: number;
  displayName: string;
};

async function geocodeWithNominatim(q: string): Promise<GeocodeResult | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  const res = await fetch(url.toString(), {
    headers: GEOCODE_HEADERS,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Nominatim failed: ${res.status}`);
  }

  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const result = data[0];
  return {
    lat: parseFloat(result.lat),
    lng: parseFloat(result.lon),
    displayName: result.display_name as string,
  };
}

async function geocodeWithPhoton(q: string): Promise<GeocodeResult | null> {
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", q);
  url.searchParams.set("limit", "1");

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Photon failed: ${res.status}`);
  }

  const data = await res.json();
  const feature = data.features?.[0];
  if (!feature?.geometry?.coordinates) {
    return null;
  }

  const [lng, lat] = feature.geometry.coordinates as [number, number];
  const props = feature.properties ?? {};
  const displayName =
    props.name && props.country
      ? `${props.name}, ${props.state ?? props.city ?? ""}, ${props.country}`.replace(
          /,\s*,/g,
          ",",
        )
      : (props.name as string) ?? q;

  return { lat, lng, displayName };
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q?.trim()) {
    return NextResponse.json({ error: "q is required" }, { status: 400 });
  }

  try {
    let result: GeocodeResult | null = null;

    try {
      result = await geocodeWithNominatim(q.trim());
    } catch {
      result = await geocodeWithPhoton(q.trim());
    }

    if (!result) {
      result = await geocodeWithPhoton(q.trim());
    }

    if (!result) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Geocode failed" },
      { status: 502 },
    );
  }
}
