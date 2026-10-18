import { NextRequest, NextResponse } from "next/server";
import { getCSP } from "@/lib/engines/registry";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  try {
    return NextResponse.json(await (await getCSP(key, req.cookies.get("qx_api_url")?.value)).homeContent(true));
  } catch (e) {
    return NextResponse.json({ class: [], list: [], filters: {}, error: (e as Error).message });
  }
}
