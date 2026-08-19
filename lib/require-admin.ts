import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";

/** Gate for admin API routes — returns the session, or a ready-to-return 401 response. */
export async function requireAdmin() {
  const { data } = await auth.getSession();
  if (!data?.user) {
    return {
      session: null,
      unauthorized: NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "관리자 인증이 필요합니다." } },
        { status: 401 }
      ),
    };
  }
  return { session: data, unauthorized: null };
}
