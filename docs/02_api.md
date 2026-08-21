# BookFlow — API Spec (api.md)

> `spec.md` §6 (API Surface)에서 분화된 문서. Next.js App Router `app/api/**/route.ts` 기준.

## Conventions

- 응답 포맷: `{ data, error }` 형태 통일
- 인증이 필요한 admin 엔드포인트는 Neon Managed Auth(Better Auth 기반, `neon_auth` 스키마) 세션이 필요. 로그인은 `/api/auth/[...path]`(Neon Auth 핸들러)가 처리하고 세션은 쿠키로 유지된다. admin 라우트는 서버에서 세션을 조회해 없으면 `401 UNAUTHORIZED`를 반환한다 (커스텀 `admins` 테이블/수동 bearer 토큰 방식 아님 — `01_db.md` §2.4 참고)
- 모든 날짜는 ISO 8601 (`timestamptz`)

---

## 1. `GET /api/services`

공개 — 예약 가능한 서비스 목록 조회

**Response 200**
```json
{
  "data": [
    { "id": "uuid", "name": "상담 30분", "durationMinutes": 30, "price": 30000 }
  ]
}
```

---

## 2. `GET /api/bookings/availability?serviceId=&date=`

공개 — 특정 서비스·날짜의 예약 가능 슬롯 조회

**Response 200**
```json
{
  "data": {
    "date": "2026-08-25",
    "slots": ["10:00", "10:30", "14:00", "14:30"]
  }
}
```

---

## 3. `POST /api/bookings`

공개 — 신규 예약 생성

**Request**
```json
{
  "serviceId": "uuid",
  "customer": { "name": "홍길동", "phone": "010-0000-0000", "email": "optional" },
  "scheduledAt": "2026-08-25T10:00:00-04:00",
  "note": "optional"
}
```

**Response 201**
```json
{ "data": { "bookingId": "uuid", "status": "pending" } }
```

**Side effect**: 생성 성공 시 n8n 웹훅(`N8N_BOOKING_WEBHOOK_URL`)으로 fire-and-forget POST (`await` 없이 `.catch()`만 — 실패해도 201 응답에는 영향 없고 `console.error`로만 로깅). 동시에 `notification_logs`에 `confirmation` 타입으로 내부 기록.

Webhook payload:
```json
{
  "bookingId": "uuid",
  "customerName": "홍길동",
  "customerEmail": "hong@example.com 또는 null",
  "serviceName": "상담 30분",
  "scheduledAt": "2026-08-25T10:00:00.000Z"
}
```

---

## 4. `GET /api/admin/bookings?status=&date=&customerId=`

관리자 전용 — 예약 목록 조회 (필터: status, date, customerId)

**Response 200**
```json
{
  "data": [
    {
      "id": "uuid",
      "customerId": "uuid",
      "customerName": "홍길동",
      "serviceName": "상담 30분",
      "scheduledAt": "2026-08-25T10:00:00-04:00",
      "status": "pending"
    }
  ]
}
```

`customerId`는 고객별 예약 이력 조회용, `customerPhone`/`serviceDurationMinutes`/`servicePrice`는 목록 UI의 보조 정보 표시용 추가 필드(additive).

---

## 5. `PATCH /api/admin/bookings/:id`

관리자 전용 — 예약 상태 변경

**Request**
```json
{ "status": "confirmed" }
```

**Response 200**
```json
{ "data": { "id": "uuid", "status": "confirmed" } }
```

**허용 status 값**: `pending` → `confirmed` | `cancelled`, `confirmed` → `completed` | `no_show`

---

## 6. `GET /api/admin/customers`

관리자 전용 — 고객 목록 + 예약 이력 요약

**Response 200**
```json
{
  "data": [
    { "id": "uuid", "name": "홍길동", "phone": "010-0000-0000", "email": "hong@example.com", "totalBookings": 3, "noShowCount": 1 }
  ]
}
```

`email`/`lastBookingAt`은 목록·상세 표시용 추가 필드(additive), 둘 다 nullable.

---

## Error Format

```json
{ "error": { "code": "SLOT_UNAVAILABLE", "message": "선택한 시간은 이미 예약되었습니다." } }
```

| Code | HTTP | 상황 |
|---|---|---|
| SLOT_UNAVAILABLE | 409 | 예약 슬롯 중복 |
| VALIDATION_ERROR | 400 | 필수값 누락 |
| UNAUTHORIZED | 401 | 관리자 인증 실패 |
| NOT_FOUND | 404 | 존재하지 않는 booking id |
