import { NextRequest, NextResponse } from "next/server";
import { getCSP } from "@/lib/engines/registry";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const sp = req.nextUrl.searchParams;
  try {
    const data = await (await getCSP(key, req.cookies.get("qx_api_url")?.value)).categoryContent(
      sp.get("tid") ?? "",
      Number(sp.get("pg") ?? 1),
      true,
      Object.fromEntries(sp.entries())
    );
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ list: [], error: (e as Error).message });
  }
}
