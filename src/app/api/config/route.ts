import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/config";

export function GET() {
  return NextResponse.json(siteConfig);
}
