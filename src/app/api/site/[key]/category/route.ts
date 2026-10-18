import { NextRequest, NextResponse } from "next/server";
import { getCSP } from "@/lib/engines/registry";
import { withSourceList } from "@/lib/with-source";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const sp = new URL(req.url).searchParams;
  const from = (sp.get("from") || req.cookies.get("qx_api_url")?.value) ?? "";
  try {
    const data = await (await getCSP(key, from)).categoryContent(
      sp.get("tid") ?? "",
      Number(sp.get("pg") ?? 1),
      true,
      Object.fromEntries(sp.entries())
    );
    if (Array.isArray(data.list)) data.list = withSourceList(data.list, key, from);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ list: [], error: (e as Error).message });
  }
}
