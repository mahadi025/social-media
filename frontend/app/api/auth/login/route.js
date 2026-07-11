import { NextResponse } from "next/server";

import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
} from "../../../../lib/constants";

export async function POST(request) {
  const body = await request.json();

  const djangoRes = await fetch(
    `${process.env.DJANGO_API_URL}/api/auth/login/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );

  const data = await djangoRes.json();

  if (!djangoRes.ok) {
    return NextResponse.json(data, { status: djangoRes.status });
  }

  const { access, refresh, user } = data;
  const response = NextResponse.json({ user });
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };

  response.cookies.set(ACCESS_TOKEN_COOKIE, access, {
    ...cookieOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, refresh, {
    ...cookieOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });

  return response;
}
