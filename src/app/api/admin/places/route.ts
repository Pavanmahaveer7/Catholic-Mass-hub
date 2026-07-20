import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, unauthorized } from "@/lib/admin";

export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return unauthorized();

  const { id, status } = await request.json();
  if (!id || !["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const place = await prisma.localPlace.update({
    where: { id },
    data: {
      status,
      approvedAt: status === "approved" ? new Date() : null,
    },
  });

  return NextResponse.json({ place });
}

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return unauthorized();

  const places = await prisma.localPlace.findMany({
    where: { status: "pending" },
    orderBy: { submittedAt: "desc" },
  });
  return NextResponse.json({ places });
}
