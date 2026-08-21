import { test, expect } from "@playwright/test";

// docs/features/feature_5_예약-생성-시-n8n-확인-메일-webhook-연동.md 스모크 테스트:
// webhook 호출은 fire-and-forget이므로, 예약 생성 API 응답(201)은 webhook 성공/실패와 무관해야 한다.
test("예약 생성은 n8n webhook 결과를 기다리지 않고 곧바로 201로 응답한다", async ({ request }) => {
  const servicesRes = await request.get("/api/services");
  expect(servicesRes.ok()).toBe(true);
  const { data: services } = await servicesRes.json();
  expect(services.length).toBeGreaterThan(0);
  const serviceId = services[0].id;

  // 다른 테스트/시드 데이터와 충돌하지 않도록 먼 미래 날짜를 사용
  const scheduledAt = new Date();
  scheduledAt.setFullYear(scheduledAt.getFullYear() + 1);
  scheduledAt.setHours(10, 0, 0, 0);

  const start = Date.now();
  const bookingRes = await request.post("/api/bookings", {
    data: {
      serviceId,
      customer: { name: "웹훅테스트", phone: `010-0000-${String(Date.now()).slice(-4)}` },
      scheduledAt: scheduledAt.toISOString(),
    },
  });
  const elapsedMs = Date.now() - start;

  expect(bookingRes.status()).toBe(201);
  const body = await bookingRes.json();
  expect(body.data.status).toBe("pending");
  expect(typeof body.data.bookingId).toBe("string");

  // fire-and-forget이므로 외부 webhook 왕복을 기다리지 않고 빠르게 응답해야 한다.
  expect(elapsedMs).toBeLessThan(5000);
});
