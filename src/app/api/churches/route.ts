import { NextRequest, NextResponse } from "next/server";
import { fetchChurches } from "@/lib/masstimes";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");
  const page = parseInt(searchParams.get("page") ?? "1", 10);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json(
      { error: "lat and lng are required" },
      { status: 400 },
    );
  }

  try {
    const churches = await fetchChurches(lat, lng, page);
    return NextResponse.json({ churches, page });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch churches" },
      { status: 502 },
    );
  }
}
