import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin, unauthorized } from "@/lib/admin";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return unauthorized();

  const streams = await prisma.onlineStream.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ streams });
}

const upsertSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  url: z.string().url(),
  language: z.string().default("English"),
  timezone: z.string().default("America/New_York"),
  scheduleSummary: z.string().optional().nullable(),
  type: z.string().default("live_mass"),
  region: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return unauthorized();

  const parsed = upsertSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid stream data" }, { status: 400 });
  }

  if (parsed.data.id) {
    const { id, ...rest } = parsed.data;
    const stream = await prisma.onlineStream.update({
      where: { id },
      data: {
        ...rest,
        verifiedAt: new Date(),
        lastCheckOk: true,
        lastCheckedAt: new Date(),
      },
    });
    return NextResponse.json({ stream });
  }

  const stream = await prisma.onlineStream.create({
    data: {
      name: parsed.data.name,
      url: parsed.data.url,
      language: parsed.data.language,
      timezone: parsed.data.timezone,
      scheduleSummary: parsed.data.scheduleSummary,
      type: parsed.data.type,
      region: parsed.data.region,
      verifiedAt: new Date(),
      lastCheckOk: true,
      lastCheckedAt: new Date(),
    },
  });
  return NextResponse.json({ stream }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return unauthorized();

  const { id } = (await request.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.onlineStream.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
