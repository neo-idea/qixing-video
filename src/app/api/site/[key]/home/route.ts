import { NextResponse } from "next/server";
import { getCSP } from "@/lib/engines/registry";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const data = await getCSP(key).homeContent(true);
  return NextResponse.json(data);
}
