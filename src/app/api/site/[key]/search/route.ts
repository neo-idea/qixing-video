import { NextRequest, NextResponse } from "next/server";
import { getCSP } from "@/lib/engines/registry";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key: siteKey } = await params;
  const key = req.nextUrl.searchParams.get("key") ?? "";
  const data = await getCSP(siteKey).searchContent(key, false);
  return NextResponse.json(data);
}
