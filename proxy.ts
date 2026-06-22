import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/shared/api/supabase/client";
import {
  WRITE_GENERATING_ENTRY_COOKIE,
  WRITE_GENERATING_ENTRY_VALUE,
  WRITE_GENERATING_PATH,
} from "@/shared/config/writeGeneratingEntry";

function clearGeneratingEntryCookie(res: NextResponse): void {
  res.cookies.set(WRITE_GENERATING_ENTRY_COOKIE, "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
  });
}

function guardGeneratingPage(req: NextRequest): NextResponse | null {
  if (req.nextUrl.pathname !== WRITE_GENERATING_PATH) return null;

  const hasEntry =
    req.cookies.get(WRITE_GENERATING_ENTRY_COOKIE)?.value ===
    WRITE_GENERATING_ENTRY_VALUE;

  if (!hasEntry) {
    return NextResponse.redirect(new URL("/write", req.url));
  }

  const res = NextResponse.next();
  clearGeneratingEntryCookie(res);
  return res;
}

async function guardAuth(req: NextRequest): Promise<NextResponse | null> {
  const protectedPaths = ["/dashboard", "/write"];

  const isProtected = protectedPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  if (!isProtected) return null;

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  console.log("session", session);

  if (!session) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return null;
}

export async function proxy(req: NextRequest) {
  const generatingGuard = guardGeneratingPage(req);
  if (generatingGuard) return generatingGuard;

  const authGuard = await guardAuth(req);
  if (authGuard) return authGuard;

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/write/:path*"],
};
