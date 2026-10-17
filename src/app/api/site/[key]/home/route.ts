import { NextResponse } from "next/server";
import { getCSP } from "@/lib/engines/registry";

export async function GET(
  _req: Request,
  { params }: { params: { key: string } }
) {
  const data = await getCSP(params.key).homeContent(true);
  return NextResponse.json(data);
}
