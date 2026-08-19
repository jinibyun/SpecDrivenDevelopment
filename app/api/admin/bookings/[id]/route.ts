import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookings } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { apiError } from "@/lib/api-error";

// 허용 status 값 (docs/02_api.md §5)
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "no_show"],
};

// PATCH /api/admin/bookings/:id — admin only
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { status?: string } | null;
  const nextStatus = body?.status;

  if (!nextStatus) {
    return apiError("VALIDATION_ERROR", "status는 필수입니다.", 400);
  }

  const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
  if (!booking) {
    return apiError("NOT_FOUND", "존재하지 않는 예약입니다.", 404);
  }

  const allowed = ALLOWED_TRANSITIONS[booking.status] ?? [];
  if (!allowed.includes(nextStatus)) {
    return apiError(
      "VALIDATION_ERROR",
      `'${booking.status}' 상태에서 '${nextStatus}'(으)로 변경할 수 없습니다.`,
      400
    );
  }

  const [updated] = await db
    .update(bookings)
    .set({ status: nextStatus, updatedAt: new Date() })
    .where(eq(bookings.id, id))
    .returning();

  return NextResponse.json({ data: { id: updated.id, status: updated.status } });
}
