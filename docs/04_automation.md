# BookFlow — Automation Scope (automation.md)

> 실제 n8n 워크플로우 구성은 STEP 5(배포) 완료 후 진행. 여기서는 "무엇을 자동화할지"만 정의.

| Trigger | Action | 상태 | 비고 |
|---|---|---|---|
| `POST /api/bookings` 성공 (신규 예약) | 고객에게 예약 확인 메시지 자동 발송 | **구현됨** | `app/api/bookings/route.ts`에서 `N8N_BOOKING_WEBHOOK_URL`로 fire-and-forget 호출. n8n 워크플로우 "BookFlow 예약 확인 Webhook"이 Production publish됨 (`https://n8n.kbusiness.ca/webhook/bookflow-confirmation`). |
| 예약일 D-1 (스케줄) | 고객에게 리마인드 메시지 자동 발송 | 미구현 | 기존 NoShow Manager 재활용 검토 |
| 고객 문의 메시지 수신 | Claude API로 자동 응답 (예약 가능 여부 안내) | 미구현 | 확장 기능, 데모 시간 여유 시 시연 |

내부 감사 기록(`notification_logs`)은 webhook 호출과 별개로 계속 남긴다 (db.md 참고). 실제 발송/수신 확인(n8n Executions 탭, 수신 메일함)은 사람이 수동으로 검증한다.

## 확인된 환경변수

| 변수 | 용도 | 등록 위치 |
|---|---|---|
| `N8N_BOOKING_WEBHOOK_URL` | 예약 확인 webhook 대상 URL | 로컬 `.env`(완료) / Vercel 프로젝트 환경변수(수동 등록 필요) |
