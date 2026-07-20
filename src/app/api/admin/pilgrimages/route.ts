import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin, unauthorized } from "@/lib/admin";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return unauthorized();

  const sites = await prisma.pilgrimageSite.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ sites });
}

const schema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  country: z.string().min(1),
  region: z.string().optional().nullable(),
  latitude: z.number(),
  longitude: z.number(),
  description: z.string().min(1),
  significance: z.string().optional().nullable(),
  bestSeason: z.string().optional().nullable(),
  peakEvents: z.array(z.string()).optional(),
  yearlySchedule: z.array(z.unknown()).optional(),
  massScheduleNotes: z.string().optional().nullable(),
  processionTimes: z.string().optional().nullable(),
  howToReach: z.record(z.string(), z.string()).optional(),
  officialUrl: z.string().url().optional().nullable().or(z.literal("")),
  livestreamUrl: z.string().url().optional().nullable().or(z.literal("")),
});

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return unauthorized();

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid pilgrimage data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const b = parsed.data;
  const payload = {
    name: b.name,
    country: b.country,
    region: b.region || null,
    latitude: b.latitude,
    longitude: b.longitude,
    description: b.description,
    significance: b.significance || null,
    bestSeason: b.bestSeason || null,
    peakEvents: JSON.stringify(b.peakEvents ?? []),
    yearlySchedule: JSON.stringify(b.yearlySchedule ?? []),
    massScheduleNotes: b.massScheduleNotes || null,
    processionTimes: b.processionTimes || null,
    howToReach: JSON.stringify(b.howToReach ?? {}),
    officialUrl: b.officialUrl || null,
    livestreamUrl: b.livestreamUrl || null,
    lastVerifiedAt: new Date(),
  };

  const site = await prisma.pilgrimageSite.upsert({
    where: { slug: b.slug },
    update: payload,
    create: { slug: b.slug, ...payload },
  });

  return NextResponse.json({ site });
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return unauthorized();

  const { slug } = (await request.json()) as { slug?: string };
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  await prisma.pilgrimageSite.delete({ where: { slug } });
  return NextResponse.json({ ok: true });
}
