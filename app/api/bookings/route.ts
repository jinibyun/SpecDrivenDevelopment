import { NextRequest, NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookings, customers, notificationLogs, services } from "@/db/schema";
import { apiError } from "@/lib/api-error";

type PostBody = {
  serviceId?: string;
  customer?: { name?: string; phone?: string; email?: string };
  scheduledAt?: string;
  note?: string;
};

// POST /api/bookings — public: create a new booking
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as PostBody | null;

  const serviceId = body?.serviceId;
  const name = body?.customer?.name?.trim();
  const phone = body?.customer?.phone?.trim();
  const email = body?.customer?.email?.trim() || null;
  const note = body?.note?.trim() || null;
  const scheduledAtRaw = body?.scheduledAt;

  if (!serviceId || !name || !phone || !scheduledAtRaw) {
    return apiError("VALIDATION_ERROR", "serviceId, customer.name, customer.phone, scheduledAt는 필수입니다.", 400);
  }

  const scheduledAt = new Date(scheduledAtRaw);
  if (Number.isNaN(scheduledAt.getTime())) {
    return apiError("VALIDATION_ERROR", "scheduledAt 형식이 올바르지 않습니다.", 400);
  }

  const [service] = await db.select().from(services).where(eq(services.id, serviceId));
  if (!service) {
    return apiError("VALIDATION_ERROR", "존재하지 않는 서비스입니다.", 400);
  }

  const [conflict] = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(
      and(eq(bookings.serviceId, serviceId), eq(bookings.scheduledAt, scheduledAt), ne(bookings.status, "cancelled"))
    );
  if (conflict) {
    return apiError("SLOT_UNAVAILABLE", "선택한 시간은 이미 예약되었습니다.", 409);
  }

  let [customer] = await db.select().from(customers).where(eq(customers.phone, phone));
  if (!customer) {
    [customer] = await db.insert(customers).values({ name, phone, email }).returning();
  }

  const [booking] = await db
    .insert(bookings)
    .values({
      customerId: customer.id,
      serviceId,
      scheduledAt,
      status: "pending",
      note,
    })
    .returning();

  // n8n 예약 확인 메일 webhook — fire-and-forget. 실패해도 예약 생성 응답(201)에는 영향 없음 (Feature #5).
  const webhookUrl = process.env.N8N_BOOKING_WEBHOOK_URL;
  if (webhookUrl) {
    fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId: booking.id,
        customerName: customer.name,
        customerEmail: customer.email,
        serviceName: service.name,
        scheduledAt: booking.scheduledAt,
      }),
    }).catch((err) => {
      console.error("n8n booking webhook failed:", err);
    });
  }

  await db.insert(notificationLogs).values({
    bookingId: booking.id,
    type: "confirmation",
    channel: "kakao",
    status: "sent",
  });

  return NextResponse.json({ data: { bookingId: booking.id, status: booking.status } }, { status: 201 });
}
