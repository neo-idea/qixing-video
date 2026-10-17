import { NextRequest, NextResponse } from "next/server";
import { resolvePlay } from "@/lib/engines/parse";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const url = sp.get("url") ?? "";
  const type = Number(sp.get("type") ?? 0);
  const result = await resolvePlay(url, type, {
    "User-Agent": "Mozilla/5.0 (Linux; Android 14)七星Video/5.0.23",
  });
  return NextResponse.json(result);
}
