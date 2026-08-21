# [Feature #3] 관리자 Logout 기능 추가

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
> 3. **PR 원칙**: 이 작업은 `feature/issue-3` 브랜치에서
>    진행되며, `master`에는 절대 직접 push하지 않는다. 모든 변경은 PR을
>    통해서만 병합되고, 병합 여부는 사람이 리뷰 후 결정한다.
> 4. **역동기화**: 마스터 문서 반영은 개발자가 별도의 '역동기화 프롬프트'를
>    내리기 전까지 보류한다.
---

## 1. 요구사항 명세 (Issue Content)

## 배경
관리자 로그인은 구현되어 있는데, 로그아웃 기능이 없음.
현재 세션을 종료할 방법이 UI에 없는 상태.

## 요구사항
- 관리자 대시보드(사이드바 또는 상단)에 "로그아웃" 버튼 추가
- 클릭 시 Neon Managed Auth 세션 종료 (authClient의 로그아웃 메서드 사용)
- 로그아웃 성공 시 /admin/login으로 리다이렉트
- 로그아웃 후 뒤로가기로 대시보드 재접근 시도해도 /admin/login으로
  다시 리다이렉트되는지 확인 (세션 실제로 끊겼는지 검증)

## 테스트
- 로그아웃 버튼 클릭 → 세션 쿠키 삭제되는지 확인
- 로그아웃 후 /admin/dashboard 직접 URL 접근 시 로그인 페이지로
  리다이렉트되는지 확인하는 스모크 테스트 1개

## 2. 배포 전 테스트 체크리스트

- [x] 스모크 테스트 작성 (spec.md §9 정책)
- [x] `npx tsc --noEmit` 통과
- [x] `npm run build` 성공

## 3. 반영된 최종 스펙 (AI 작업 결과물)

**UI**
- `components/admin/sidebar.tsx`: 하단 프로필 영역(사이드바 footer)에 "로그아웃" 버튼 추가. 클릭 시 `authClient.signOut()`(Neon Managed Auth) 호출 → `/admin/login`으로 이동 + `router.refresh()`.
- 별도의 신규 라우트/페이지는 없음. 로그아웃 API는 Neon Auth 프록시(`app/api/auth/[...path]`)가 기존과 동일하게 처리 (`POST /api/auth/sign-out` — Better Auth 표준 엔드포인트, 세션 관련 쿠키 4종을 `Max-Age=0`으로 만료시킴).
- 세션 재확인은 기존 `proxy.ts`(matcher: `/admin/dashboard/:path*`, `/admin/customers/:path*`)가 매 요청마다 수행 — 로그아웃 후 뒤로가기/직접 URL 접근 모두 이 프록시에서 재차단됨. 이번 작업에서 인증 로직 자체는 변경하지 않음.

**테스트**
- `tests/admin-logout.spec.ts` (Playwright) 신규 추가: 로그인 → 세션 쿠키 존재 확인 → 로그아웃 클릭 → 세션 쿠키 삭제 확인 → `/admin/dashboard` 직접 접근 시 `/admin/login` 리다이렉트 확인. `npx playwright test`로 실행, 통과 확인함.
- `playwright.config.ts` 신규 추가 (webServer가 기존 실행 중인 `next dev`(포트 3000)를 재사용하거나, 없으면 새로 띄움). `package.json`에 `test:e2e` 스크립트 추가.
- `@playwright/test`를 devDependency로 신규 설치.

**DB/API**: 변경 없음.

---
### ⚠️ 개발자 전용 — 역동기화 프롬프트 템플릿 (복사해서 사용)

아래 프롬프트를 복사하여 새 채팅창에 입력하고 마스터 문서를 최신화하세요.

```text
@docs/00_spec.md @docs/01_db.md @docs/02_api.md @docs/03_ui.md @docs/04_automation.md
@(현재 작업한 코드 폴더/파일들)

현재 구현된 실제 소스 코드를 정답으로 간주하고, 변경된 사항을 바탕으로
마스터 문서 5개를 최신화(덮어쓰기)해. 코드는 절대 수정하지 마.
```
