import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_COOKIE,
} from "../../../../lib/constants";

async function readRequestBody(request) {
  if (request.method === "GET" || request.method === "HEAD") {
    return { body: undefined, contentType: null };
  }
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    return { body: await request.formData(), contentType: null };
  }
  return { body: await request.text(), contentType: "application/json" };
}

function forwardToDjango(url, method, accessToken, body, contentType) {
  const headers = { Authorization: `Bearer ${accessToken}` };
  if (contentType) headers["Content-Type"] = contentType;
  return fetch(url, { method, headers, body });
}

async function refreshAccessToken(refreshToken) {
  const res = await fetch(
    `${process.env.DJANGO_API_URL}/api/auth/token/refresh/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    },
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.access;
}

async function buildResponse(djangoRes) {
  const contentType = djangoRes.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const data = await djangoRes.json();
    return NextResponse.json(data, { status: djangoRes.status });
  }
  const text = await djangoRes.text();
  return new NextResponse(text, { status: djangoRes.status });
}

async function handle(request, { params }) {
  const { path } = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return NextResponse.json(
      { detail: "Authentication credentials were not provided." },
      { status: 401 },
    );
  }

  const url = `${process.env.DJANGO_API_URL}/api/feed/${path.join("/")}/${request.nextUrl.search}`;
  const { body, contentType } = await readRequestBody(request);

  let djangoRes = await forwardToDjango(
    url,
    request.method,
    accessToken,
    body,
    contentType,
  );

  let refreshedToken = null;
  if (djangoRes.status === 401 && refreshToken) {
    refreshedToken = await refreshAccessToken(refreshToken);
    if (refreshedToken) {
      djangoRes = await forwardToDjango(
        url,
        request.method,
        refreshedToken,
        body,
        contentType,
      );
    }
  }

  const response = await buildResponse(djangoRes);
  if (refreshedToken) {
    response.cookies.set(ACCESS_TOKEN_COOKIE, refreshedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });
  }
  return response;
}

export { handle as GET, handle as POST };
