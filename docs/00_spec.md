# BookFlow  Spec (00_spec.md)

> 이 문서는 `앱_기획_요구사항_정의_AI예약관리시스템` (기획 요구사항 정의서)를 개발 실행 스펙으로 변환한 문서입니다.
> 이후 이 문서에서 `01_db.md` / `02_api.md` / `03_ui.md`가 분화됩니다.

## 1. Overview

- **Project name**: BookFlow
- **One-line pitch**: 소상공인을 위한 AI 기반 예약 관리 시스템 — 고객용 예약, 관리자 대시보드, 자동 알림/상담을 하나로
- **Primary users**:
  - 소상공인 사장님 (관리자) — 예약 현황 관리, 노쇼 추적
  - 고객 (비로그인) — 서비스 예약 신청
- **Core problem being solved**: 전화/카톡 기반 수동 예약 운영으로 인한 이중예약, 예약 누락, 노쇼 관리 부재

## 2. Tech Stack & Constraints

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Styling | Tailwind CSS + ShadCN |
| Database | Neon DB (PostgreSQL) |
| ORM | Drizzle ORM (`drizzle-kit`으로 스키마/마이그레이션 관리) |
| Auth | Neon Managed Auth (Better Auth 기반, `neon_auth` 스키마) |
| Hosting | Vercel |
| Automation | n8n (알림 발송 · 챗봇 상담) |
| AI Model | Claude (Sonnet 계열) |

**제약 조건**: 모든 기능은 위 스택 내에서 구현 가능해야 함. 결제 연동은 이번 데모 범위에서 제외.

## 3. Core Features (MVP Scope)

1. **고객용 예약 신청** — 서비스 선택 → 가능한 날짜/시간 슬롯 확인 → 정보 입력 → 신청 제출
2. **관리자 대시보드** — 예약 목록 조회, 상태 변경(대기/확정/취소/완료), 고객 목록, 노쇼 기록
3. **자동 알림** — 예약 접수 시 확인 메시지 자동 발송, 예약 전 리마인드 발송 (n8n)
4. **AI 상담 챗봇 (선택 확장)** — 예약 가능 여부 문의에 자동 응답

## 4. User Flows

### 4.1 고객 (Customer)
```
접속 → 서비스 선택 → 날짜/시간 슬롯 확인 → 이름·연락처 입력
→ 예약 신청 제출 → 자동 확인 메시지 수신
```

### 4.2 관리자 (Admin)
```
로그인 → 대시보드 진입 → 예약 목록 확인 → 승인/거절 처리
→ (예약일 임박 시) 자동 리마인드 발송 → 완료/노쇼 처리
```

## 5. Data Model (요약 — 상세는 `01_db.md`)

핵심 엔티티: `Customers`, `Services`, `Bookings`, `Admins`, `NotificationLogs`

- 한 명의 Customer는 여러 개의 Booking을 가짐 (1:N)
- 한 개의 Booking은 하나의 Service에 속함 (N:1)
- 한 개의 Booking은 여러 개의 NotificationLog를 가질 수 있음 (1:N)

## 6. API Surface (요약 — 상세는 `02_api.md`)

| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/api/services` | 서비스 항목 목록 조회 |
| GET | `/api/bookings/availability` | 특정 날짜의 예약 가능 슬롯 조회 |
| POST | `/api/bookings` | 신규 예약 생성 |
| GET | `/api/admin/bookings` | (관리자) 전체 예약 목록 조회 |
| PATCH | `/api/admin/bookings/:id` | (관리자) 예약 상태 변경 |
| GET | `/api/admin/customers` | (관리자) 고객 목록 조회 |

## 7. UI Structure (요약 — 상세는 `03_ui.md`)

- `/` — 고객용 예약 페이지 (서비스 선택 → 슬롯 선택 → 폼)
- `/admin/login` — 관리자 로그인
- `/admin/dashboard` — 예약 현황 대시보드
- `/admin/customers` — 고객 관리

**Visual tone**: 고객 페이지는 화이트 톤의 미니멀 예약 폼, 관리자 대시보드는 다크 사이드바 + 화이트 콘텐츠의 SaaS 스타일 (신규 브랜드 톤으로 기존 프로젝트와 차별화)

## 8. Automation Scope (n8n)

- 예약 생성(`POST /api/bookings`) 이벤트 → n8n 웹훅 트리거 → 확인 메시지 자동 발송
- 예약 시간 D-1 → n8n 스케줄 트리거 → 리마인드 발송
- (확장) 고객 문의 메시지 → Claude API 호출 → 자동 응답

## 9. Testing Policy

이슈 기반 개발 시, 기능 구현과 함께 스모크 테스트 1~2개를 함께 작성한다.
예: `POST /api/bookings` 호출 시 올바른 상태 값(`pending`)으로 저장되는지 확인하는 테스트.

## 10. Out of Scope (This Demo)

- 결제 연동
- 다국어 지원
- 실시간 채팅 상담 (챗봇 자동 응답까지만 포함)
- 다중 지점/다중 관리자 권한 분리
