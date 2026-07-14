import { NextResponse } from "next/server";

const PROTECTED_PATHS = ["/"];
const AUTH_PATHS = ["/login", "/registration"];

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.has("access_token");

  if (PROTECTED_PATHS.includes(pathname) && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (AUTH_PATHS.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/registration"],
};
