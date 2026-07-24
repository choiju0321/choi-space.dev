import { NextResponse } from "next/server";
import { hasWriteSession, isWriteSecretConfigured } from "@/lib/write/auth";

export async function GET() {
  return NextResponse.json({
    configured: isWriteSecretConfigured(),
    authenticated: await hasWriteSession(),
  });
}
