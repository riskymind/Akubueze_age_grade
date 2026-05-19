import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const PUBLIC_ROUTES = [
  "/login",
  "/auth/suspended",
  "/auth/inactive",
  "/auth/set-password",
];

const SUPERADMIN_ROUTES = ["/admin/settings", "/admin/admins"];
const ADMIN_ROUTES = ["/admin"];

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const pathname = nextUrl.pathname;

  const isPublic =
    PUBLIC_ROUTES.some((r) => pathname.startsWith(r)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon");

  if (isPublic) return NextResponse.next();

  if (!session?.user) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { role, status, mustResetPassword } = session.user;

  if (status === "SUSPENDED")
    return NextResponse.redirect(new URL("/auth/suspended", nextUrl.origin));
  if (status === "INACTIVE")
    return NextResponse.redirect(new URL("/auth/inactive", nextUrl.origin));

  if (mustResetPassword && !pathname.startsWith("/auth/reset-password")) {
    return NextResponse.redirect(
      new URL("/auth/reset-password", nextUrl.origin)
    );
  }

  if (SUPERADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (role !== "SUPER_ADMIN")
      return NextResponse.redirect(new URL("/unauthorized", nextUrl.origin));
  }

  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (role === "MEMBER")
      return NextResponse.redirect(new URL("/unauthorized", nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
