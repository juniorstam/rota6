import { NextResponse } from "next/server";

export const revalidate = 0;

export function GET(request: Request) {
  return NextResponse.redirect(new URL("/icon.svg", request.url), 307);
}
