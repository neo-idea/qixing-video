import { NextRequest, NextResponse } from "next/server";
import { getCSP } from "@/lib/engines/registry";

export async function GET(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  const key = req.nextUrl.searchParams.get("key") ?? "";
  const data = await getCSP(params.key).searchContent(key, false);
  return NextResponse.json(data);
}
