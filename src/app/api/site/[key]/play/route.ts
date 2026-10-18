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
  try {
    return NextResponse.json(
      await (await getCSP(key, req.cookies.get("qx_api_url")?.value)).playerContent(flag, id, [])
    );
  } catch (e) {
    return NextResponse.json({ parse: 0, url: "", error: (e as Error).message }, { status: 404 });
  }
}
