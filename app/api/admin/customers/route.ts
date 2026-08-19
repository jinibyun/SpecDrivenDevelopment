import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookings, customers } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

// GET /api/admin/customers — admin only: customer list + booking summary
export async function GET() {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  const rows = await db
    .select({
      id: customers.id,
      name: customers.name,
      phone: customers.phone,
      email: customers.email,
      totalBookings: sql<number>`count(${bookings.id})::int`,
      noShowCount: sql<number>`count(*) filter (where ${bookings.status} = 'no_show')::int`,
      lastBookingAt: sql<string | null>`max(${bookings.scheduledAt})`,
    })
    .from(customers)
    .leftJoin(bookings, eq(bookings.customerId, customers.id))
    .groupBy(customers.id)
    .orderBy(sql`max(${bookings.scheduledAt}) desc nulls last`);

  return NextResponse.json({ data: rows });
}
