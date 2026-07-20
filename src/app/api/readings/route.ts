import { NextRequest, NextResponse } from "next/server";
import { fetchDailyReadings } from "@/lib/usccb-readings";

export async function GET(request: NextRequest) {
  const dateParam = request.nextUrl.searchParams.get("date");
  const date = dateParam ? new Date(`${dateParam}T12:00:00`) : new Date();

  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  try {
    const readings = await fetchDailyReadings(date);
    return NextResponse.json(readings);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch readings" },
      { status: 502 },
    );
  }
}
