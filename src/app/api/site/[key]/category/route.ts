import { NextRequest, NextResponse } from "next/server";
import { getCSP } from "@/lib/engines/registry";

export async function GET(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  const sp = req.nextUrl.searchParams;
  const data = await getCSP(params.key).categoryContent(
    sp.get("tid") ?? "",
    Number(sp.get("pg") ?? 1),
    true,
    Object.fromEntries(sp.entries())
  );
  return NextResponse.json(data);
}
