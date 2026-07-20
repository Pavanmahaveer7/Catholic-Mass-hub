import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const favorites = await prisma.favoriteParish.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ favorites });
}

const schema = z.object({
  churchId: z.string().min(1),
  name: z.string().min(1),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  phone: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid parish data" }, { status: 400 });
  }

  const favorite = await prisma.favoriteParish.upsert({
    where: {
      userId_churchId: {
        userId: session.id,
        churchId: parsed.data.churchId,
      },
    },
    update: {
      name: parsed.data.name,
      address: parsed.data.address ?? null,
      city: parsed.data.city ?? null,
      region: parsed.data.region ?? null,
      latitude: parsed.data.latitude ?? null,
      longitude: parsed.data.longitude ?? null,
      phone: parsed.data.phone ?? null,
      website: parsed.data.website ?? null,
    },
    create: {
      userId: session.id,
      churchId: parsed.data.churchId,
      name: parsed.data.name,
      address: parsed.data.address ?? null,
      city: parsed.data.city ?? null,
      region: parsed.data.region ?? null,
      latitude: parsed.data.latitude ?? null,
      longitude: parsed.data.longitude ?? null,
      phone: parsed.data.phone ?? null,
      website: parsed.data.website ?? null,
    },
  });

  return NextResponse.json({ favorite });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { churchId } = (await request.json()) as { churchId?: string };
  if (!churchId) {
    return NextResponse.json({ error: "churchId required" }, { status: 400 });
  }

  await prisma.favoriteParish.deleteMany({
    where: { userId: session.id, churchId },
  });
  return NextResponse.json({ ok: true });
}
