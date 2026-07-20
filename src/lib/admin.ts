import { NextRequest, NextResponse } from "next/server";
import { getSession, type SessionUser } from "@/lib/auth";

/** Admin session OR valid x-admin-key / Authorization bearer ADMIN_KEY. */
export async function requireAdmin(
  request?: NextRequest,
): Promise<SessionUser | null> {
  const session = await getSession();
  if (session?.role === "admin") return session;

  if (request) {
    const key =
      request.headers.get("x-admin-key") ??
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (key && process.env.ADMIN_KEY && key === process.env.ADMIN_KEY) {
      return {
        id: "admin-key",
        email: "admin@local",
        name: "Admin",
        role: "admin",
        locale: "en",
      };
    }
  }

  // Dev convenience: allow if ADMIN_KEY unset
  if (process.env.NODE_ENV !== "production" && !process.env.ADMIN_KEY) {
    if (session) {
      return { ...session, role: "admin" };
    }
  }

  return null;
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/** Vercel Cron or manual with CRON_SECRET. */
export function requireCron(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}
