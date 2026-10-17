import { NextRequest, NextResponse } from "next/server";
import { getCSP } from "@/lib/engines/registry";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const sp = req.nextUrl.searchParams;
  const flag = sp.get("flag") ?? "";
  const id = sp.get("id") ?? "";
  const data = await getCSP(key).playerContent(flag, id, []);
  return NextResponse.json(data);
}
