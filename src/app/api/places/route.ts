import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category");
  const status = searchParams.get("status") ?? "approved";

  try {
    const places = await prisma.localPlace.findMany({
      where: {
        status,
        ...(category ? { category } : {}),
      },
      orderBy: [{ featured: "desc" }, { name: "asc" }],
    });
    return NextResponse.json({ places });
  } catch {
    return NextResponse.json({ places: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const place = await prisma.localPlace.create({
      data: {
        slug: `${slug}-${Date.now()}`,
        status: "pending",
        name: body.name,
        category: body.category,
        description: body.description,
        addressStreet: body.addressStreet,
        addressCity: body.addressCity,
        addressRegion: body.addressRegion,
        addressPostal: body.addressPostal,
        country: body.country ?? "United States",
        phone: body.phone,
        email: body.email,
        website: body.website,
        ownerName: body.ownerName,
        ownerEmail: body.ownerEmail,
        amenities: JSON.stringify(body.amenities ?? []),
      },
    });

    return NextResponse.json({ place, message: "Submission received for review." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Submission failed" },
      { status: 400 },
    );
  }
}
