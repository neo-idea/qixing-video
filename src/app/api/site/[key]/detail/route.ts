import { NextRequest, NextResponse } from "next/server";
import { getCSP } from "@/lib/engines/registry";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const id = req.nextUrl.searchParams.get("id") ?? "";
  try {
    return NextResponse.json(
      await (await getCSP(key, req.cookies.get("qx_api_url")?.value)).detailContent([id])
    );
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 404 });
  }
}
