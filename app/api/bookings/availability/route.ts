import { NextRequest, NextResponse } from "next/server";
import { and, eq, gte, lt, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookings, services } from "@/db/schema";
import { apiError } from "@/lib/api-error";
import { candidateSlotsFor, isPastDate, isShopClosed } from "@/lib/business-hours";

// GET /api/bookings/availability?serviceId=&date= — public
export async function GET(request: NextRequest) {
  const serviceId = request.nextUrl.searchParams.get("serviceId");
  const date = request.nextUrl.searchParams.get("date");

  if (!serviceId || !date) {
    return apiError("VALIDATION_ERROR", "serviceId와 date는 필수입니다.", 400);
  }

  const dayStart = new Date(`${date}T00:00:00`);
  if (Number.isNaN(dayStart.getTime())) {
    return apiError("VALIDATION_ERROR", "date 형식이 올바르지 않습니다.", 400);
  }

  const [service] = await db.select().from(services).where(eq(services.id, serviceId));
  if (!service) {
    return apiError("VALIDATION_ERROR", "존재하지 않는 서비스입니다.", 400);
  }

  if (isShopClosed(dayStart) || isPastDate(dayStart)) {
    return NextResponse.json({ data: { date, slots: [] } });
  }

  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const existing = await db
    .select({ scheduledAt: bookings.scheduledAt })
    .from(bookings)
    .where(
      and(
        eq(bookings.serviceId, serviceId),
        ne(bookings.status, "cancelled"),
        gte(bookings.scheduledAt, dayStart),
        lt(bookings.scheduledAt, dayEnd)
      )
    );

  const taken = new Set(
    existing.map((b) => {
      const d = new Date(b.scheduledAt);
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    })
  );

  const slots = candidateSlotsFor(service.durationMinutes).filter((s) => !taken.has(s));

  return NextResponse.json({ data: { date, slots } });
}
