import { NextRequest, NextResponse } from "next/server";
import { getCSP } from "@/lib/engines/registry";

export async function GET(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  const id = req.nextUrl.searchParams.get("id") ?? "";
  try {
    return NextResponse.json(await getCSP(params.key).detailContent([id]));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 404 });
  }
}
