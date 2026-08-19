# BookFlow — Automation Scope (automation.md)

> 실제 n8n 워크플로우 구성은 STEP 5(배포) 완료 후 진행. 여기서는 "무엇을 자동화할지"만 정의.

| Trigger | Action | 비고 |
|---|---|---|
| `POST /api/bookings` 성공 (신규 예약) | 고객에게 예약 확인 메시지 자동 발송 | api.md의 side effect와 연결 |
| 예약일 D-1 (스케줄) | 고객에게 리마인드 메시지 자동 발송 | 기존 NoShow Manager 재활용 검토 |
| 고객 문의 메시지 수신 | Claude API로 자동 응답 (예약 가능 여부 안내) | 확장 기능, 데모 시간 여유 시 시연 |

모든 발송 결과는 `notification_logs` 테이블에 기록 (db.md 참고).
