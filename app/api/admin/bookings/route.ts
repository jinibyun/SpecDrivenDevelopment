import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, gte, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookings, customers, services } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

// GET /api/admin/bookings?status=&date=&customerId= — admin only
export async function GET(request: NextRequest) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  const status = request.nextUrl.searchParams.get("status");
  const date = request.nextUrl.searchParams.get("date");
  const customerId = request.nextUrl.searchParams.get("customerId");

  const conditions = [];
  if (status) conditions.push(eq(bookings.status, status));
  if (customerId) conditions.push(eq(bookings.customerId, customerId));
  if (date) {
    const dayStart = new Date(`${date}T00:00:00`);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    conditions.push(gte(bookings.scheduledAt, dayStart), lt(bookings.scheduledAt, dayEnd));
  }

  const rows = await db
    .select({
      id: bookings.id,
      customerId: bookings.customerId,
      customerName: customers.name,
      customerPhone: customers.phone,
      serviceName: services.name,
      serviceDurationMinutes: services.durationMinutes,
      servicePrice: services.price,
      scheduledAt: bookings.scheduledAt,
      status: bookings.status,
    })
    .from(bookings)
    .innerJoin(customers, eq(bookings.customerId, customers.id))
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(bookings.scheduledAt));

  return NextResponse.json({ data: rows });
}
