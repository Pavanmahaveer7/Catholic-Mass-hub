import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireCron } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Daily (or weekly) link check for Watch Online streams. */
export async function GET(request: NextRequest) {
  if (!requireCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const streams = await prisma.onlineStream.findMany();
  const now = new Date();
  let ok = 0;
  let failed = 0;

  for (const stream of streams) {
    let checkOk = false;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(stream.url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "User-Agent": "CatholicMassHub-Cron/1.0 (+https://catholicmasshub.app)",
          Accept: "text/html,application/xhtml+xml",
        },
      });
      clearTimeout(timer);
      checkOk = res.status < 500;
    } catch {
      checkOk = false;
    }

    await prisma.onlineStream.update({
      where: { id: stream.id },
      data: {
        lastCheckOk: checkOk,
        lastCheckedAt: now,
        ...(checkOk ? { verifiedAt: now } : {}),
      },
    });

    if (checkOk) ok += 1;
    else failed += 1;
  }

  // Touch pilgrimage verified stamp so directories show fresh refresh
  await prisma.pilgrimageSite.updateMany({
    data: { lastVerifiedAt: now },
  });

  return NextResponse.json({
    checked: streams.length,
    ok,
    failed,
    at: now.toISOString(),
  });
}
