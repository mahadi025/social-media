import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();

  const djangoRes = await fetch(
    `${process.env.DJANGO_API_URL}/api/auth/register/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );

  const data = await djangoRes.json();
  return NextResponse.json(data, { status: djangoRes.status });
}
