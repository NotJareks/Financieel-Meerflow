import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS = new Set(["/login", "/register"]);

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const path = nextUrl.pathname;
  const isLoggedIn = Boolean(session?.user);
  const isApi = path.startsWith("/api");
  const isPublic =
    PUBLIC_PATHS.has(path) ||
    path.startsWith("/api/auth") ||
    path.startsWith("/api/register");

  // API routes: require a session (except auth endpoints)
  if (isApi && !isLoggedIn && !isPublic) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  // Pages: redirect unauthenticated users to the login page
  if (!isLoggedIn && !isPublic && !isApi) {
    const loginUrl = new URL("/login", nextUrl);
    if (path !== "/") {
      loginUrl.searchParams.set("callbackUrl", path);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Logged-in users don't need the auth pages
  if (isLoggedIn && !isApi && isPublic) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // Admin area
  if (path.startsWith("/admin") && session?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
