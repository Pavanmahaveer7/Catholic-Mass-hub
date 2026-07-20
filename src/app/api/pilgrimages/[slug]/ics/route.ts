import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseYearlySchedule } from "@/lib/pilgrimage-schedule";
import { buildPilgrimageIcs } from "@/lib/ics";

type Props = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Props) {
  const { slug } = await params;
  const site = await prisma.pilgrimageSite.findUnique({ where: { slug } });
  if (!site) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const events = parseYearlySchedule(site.yearlySchedule);
  const ics = buildPilgrimageIcs(site.name, site.slug, events);

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${site.slug}-${new Date().getFullYear()}.ics"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
