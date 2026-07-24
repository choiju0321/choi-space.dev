import { NextResponse } from "next/server";
import {
  createWriteSessionToken,
  isWriteSecretConfigured,
  verifyWritePassword,
  writeSessionCookieOptions,
} from "@/lib/write/auth";

export async function POST(request: Request) {
  if (!isWriteSecretConfigured()) {
    return NextResponse.json(
      {
        error:
          "LIFE_WRITE_SECRET 환경 변수가 필요합니다. .env.local 에 설정하세요.",
      },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    password?: string;
  } | null;

  const password = body?.password?.trim() ?? "";
  if (!password || !verifyWritePassword(password)) {
    return NextResponse.json(
      { error: "비밀번호가 올바르지 않습니다." },
      { status: 401 },
    );
  }

  const token = createWriteSessionToken();
  const response = NextResponse.json({ ok: true });
  const cookie = writeSessionCookieOptions(token);
  response.cookies.set(cookie);
  return response;
}
