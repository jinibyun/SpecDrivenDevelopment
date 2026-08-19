# BookFlow

소상공인을 위한 AI 기반 예약 관리 시스템. Next.js(App Router) + Tailwind CSS + ShadCN으로 구현된 프런트엔드입니다. 스펙 문서는 `00_spec.md`~`04_automation.md`를 참고하세요.

## Routes

- `/` — 고객용 예약 페이지
- `/admin/login` — 관리자 로그인 (데모 비밀번호: `demo1234`)
- `/admin/dashboard` — 예약 현황 대시보드
- `/admin/customers` — 고객 관리

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

데이터는 `lib/mock-data.ts`에 정의된 목업이며, 실제 API(`02_api.md`)와 DB(`01_db.md`) 연동은 아직 포함되어 있지 않습니다.
