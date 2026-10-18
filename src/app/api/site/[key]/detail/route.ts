import { NextRequest, NextResponse } from "next/server";
import { getCSP } from "@/lib/engines/registry";
import { withSource } from "@/lib/with-source";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const sp = new URL(req.url).searchParams;
  const id = sp.get("id") ?? "";
  const from = (sp.get("from") || req.cookies.get("qx_api_url")?.value) ?? "";
  try {
    return NextResponse.json(
      withSource(await (await getCSP(key, from)).detailContent([id]), key, from)
    );
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 404 });
  }
}
