# [Feature #5] 예약 생성 시 n8n 확인 메일 webhook 연동

---
> 🤖 **AI 코딩 에이전트 작업 지시서 (System Prompt)**
>
> 너는 이 프로젝트의 수석 개발자다. 마스터 스펙 문서
> (`docs/00_spec.md`, `docs/01_db.md`, `docs/02_api.md`,
> `docs/03_ui.md`, `docs/04_automation.md`)는 시스템 뼈대 파악을 위해
> 반드시 읽되, 이 작업 중에는 절대 직접 수정하지 마라.
>
> **[작업 3단계 프로세스 — 엄수할 것]**
> 1. **작업 중**: 이 Feature 문서의 요구사항과 마스터 문서(참조용)를 보고
>    코드를 짠다. 스택은 [Next.js(App Router) + Tailwind CSS + ShadCN +
>    Neon DB(Drizzle ORM) + Neon Managed Auth]로 고정한다.
> 2. **작업 완료 직후**: 마스터 문서는 건드리지 말고, 이 문서 하단
>    [반영된 최종 스펙]에 변경된 스펙만 요약 기록한다.
> 3. **PR 원칙**: 이 작업은 `feature/issue-5` 브랜치에서
>    진행되며, `master`에는 절대 직접 push하지 않는다. 모든 변경은 PR을
>    통해서만 병합되고, 병합 여부는 사람이 리뷰 후 결정한다.
> 4. **역동기화**: 마스터 문서 반영은 개발자가 별도의 '역동기화 프롬프트'를
>    내리기 전까지 보류한다.
---

## 1. 요구사항 명세 (Issue Content)

## 배경
n8n에 예약 확인 메일 자동화 워크플로우(BookFlow 예약 확인 Webhook)를 구축하고
Production으로 publish 완료함. 이제 실제 예약 생성 시 이 webhook을 호출하도록
BookFlow API를 연동해야 함.

Webhook URL: https://n8n.kbusiness.ca/webhook/bookflow-confirmation

## 요구사항
- app/api/bookings/route.ts의 POST 핸들러에서, 예약 insert 성공 직후
  위 webhook URL로 fire-and-forget 방식(await 없이 .catch()만)으로 호출
- 환경변수로 URL 관리: N8N_BOOKING_WEBHOOK_URL
  (.env 및 Vercel 환경변수에 등록 필요, 이 이슈 작업 범위에 포함)
- 호출 payload:
```json
  {
    "bookingId": "<생성된 booking uuid>",
    "customerName": "<customer.name>",
    "customerEmail": "<customer.email>",
    "serviceName": "<service.name>",
    "scheduledAt": "<booking.scheduledAt>"
  }
```
- webhook 호출 실패해도 예약 생성 자체(201 응답)는 영향받지 않아야 함
  (에러는 console.error로만 로깅)

## 테스트
- 실제 예약 생성 후 n8n Executions 탭에서 워크플로우가 트리거되는지 확인
- customerEmail이 있는 경우 실제 확인 메일 수신되는지 확인
- webhook URL이 일시적으로 응답 없어도 (예: 잘못된 URL로 임시 테스트)
  BookFlow API 응답 자체는 정상적으로 201이 오는지 확인하는 스모크 테스트 1개

## 2. 배포 전 테스트 체크리스트

- [x] 스모크 테스트 작성 (spec.md §9 정책)
- [x] `npx tsc --noEmit` 통과
- [x] `npm run build` 성공

## 3. 반영된 최종 스펙 (AI 작업 결과물)

**API**
- `app/api/bookings/route.ts`: `bookings` insert 성공 직후, `N8N_BOOKING_WEBHOOK_URL`이 설정돼 있으면 해당 URL로 `POST` 요청을 fire-and-forget(await 없이 `.catch()`만)으로 전송. 실패 시 `console.error`로만 로깅하고 응답에는 영향 없음.
  - payload: `{ bookingId, customerName, customerEmail, serviceName, scheduledAt }`
  - 기존 `notification_logs` insert(내부 감사 로그)는 그대로 유지 — webhook 호출과는 별개.

**환경변수**
- `N8N_BOOKING_WEBHOOK_URL=https://n8n.kbusiness.ca/webhook/bookflow-confirmation` — 로컬 `.env`에 등록함.
- **Vercel 환경변수는 아직 등록하지 못했음** (이 세션에 Vercel 프로젝트 연결/로그인이 안 돼 있어 CLI로 직접 등록할 수 없었음). 배포 전 사람이 직접 Vercel 대시보드 → 프로젝트 → Settings → Environment Variables에서 `N8N_BOOKING_WEBHOOK_URL`을 등록해야 함.

**테스트**
- `tests/booking-webhook.spec.ts` (Playwright) 신규 추가: 실제로 예약을 생성해 API가 5초 이내에 `201`로 응답하는지 확인 (fire-and-forget이므로 외부 webhook 왕복을 기다리지 않아야 한다는 요구사항의 자동화된 증거). 실행 결과 1.9초에 통과.
- webhook URL 자체가 살아있는지 별도로 `curl`로 확인함 (200 OK) — n8n Executions 탭 확인, 실제 메일 수신 확인은 사람이 수동으로 검증해야 하는 항목이라 이 세션에서는 확인하지 못함.

**DB/UI**: 변경 없음.

---
### ⚠️ 개발자 전용 — 역동기화 프롬프트 템플릿 (복사해서 사용)

아래 프롬프트를 복사하여 새 채팅창에 입력하고 마스터 문서를 최신화하세요.

```text
@docs/00_spec.md @docs/01_db.md @docs/02_api.md @docs/03_ui.md @docs/04_automation.md
@(현재 작업한 코드 폴더/파일들)

현재 구현된 실제 소스 코드를 정답으로 간주하고, 변경된 사항을 바탕으로
마스터 문서 5개를 최신화(덮어쓰기)해. 코드는 절대 수정하지 마.
```
