import { NextRequest, NextResponse } from "next/server";
import { getCSP } from "@/lib/engines/registry";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key: siteKey } = await params;
  const key = req.nextUrl.searchParams.get("key") ?? "";
  try {
    return NextResponse.json(
      await (await getCSP(siteKey, req.cookies.get("qx_api_url")?.value)).searchContent(key, false)
    );
  } catch (e) {
    return NextResponse.json({ list: [], error: (e as Error).message });
  }
}
