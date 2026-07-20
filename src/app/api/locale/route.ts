import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  createSessionToken,
  getSession,
  setSessionCookie,
  type SessionUser,
} from "@/lib/auth";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n";

const schema = z.object({
  locale: z.enum(["en", "es"]),
});

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const locale = parsed.data.locale as Locale;
  const jar = await cookies();
  jar.set(LOCALE_COOKIE, locale, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  const session = await getSession();
  if (session) {
    await prisma.user.update({
      where: { id: session.id },
      data: { locale },
    });
    const next: SessionUser = { ...session, locale };
    const token = await createSessionToken(next);
    await setSessionCookie(token);
  }

  return NextResponse.json({ locale });
}

export async function GET() {
  const jar = await cookies();
  const fromCookie = jar.get(LOCALE_COOKIE)?.value;
  const session = await getSession();
  const locale =
    session?.locale ??
    (fromCookie === "es" ? "es" : "en");
  return NextResponse.json({ locale });
}
