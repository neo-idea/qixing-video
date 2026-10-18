import { NextRequest, NextResponse } from "next/server";
import { getCSP } from "@/lib/engines/registry";
import { withSourceList } from "@/lib/with-source";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const from = (new URL(req.url).searchParams.get("from") || req.cookies.get("qx_api_url")?.value) ?? "";
  try {
    const data = await (await getCSP(key, from)).homeContent(true);
    if (Array.isArray(data.list)) data.list = withSourceList(data.list, key, from);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ class: [], list: [], filters: {}, error: (e as Error).message });
  }
}
