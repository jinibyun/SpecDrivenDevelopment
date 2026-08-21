import { test, expect } from "@playwright/test";

// docs/features/feature_3_관리자-logout-기능-추가.md 스모크 테스트:
// 1) 로그아웃 버튼 클릭 → 세션 쿠키 삭제
// 2) 로그아웃 후 /admin/dashboard 직접 접근 → /admin/login으로 리다이렉트

const ADMIN_EMAIL = "admin@bookflow.app";
const ADMIN_PASSWORD = "demo1234";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/admin/login");
  await page.fill("#email", ADMIN_EMAIL);
  await page.fill("#password", ADMIN_PASSWORD);
  await page.click("button:has-text('로그인')");
  await page.waitForURL("**/admin/dashboard");
}

test("로그아웃하면 세션 쿠키가 삭제되고, 대시보드 직접 접근 시 로그인 페이지로 리다이렉트된다", async ({ page }) => {
  await login(page);

  const cookiesAfterLogin = await page.context().cookies();
  expect(cookiesAfterLogin.some((c) => c.name.includes("session"))).toBe(true);

  await page.click("button[title='로그아웃']");
  await page.waitForURL("**/admin/login");

  const cookiesAfterLogout = await page.context().cookies();
  expect(cookiesAfterLogout.some((c) => c.name.includes("session"))).toBe(false);

  // 뒤로가기 대신 직접 URL 접근으로 세션 종료를 검증 (proxy.ts가 매 요청마다 세션을 재확인)
  await page.goto("/admin/dashboard");
  await page.waitForURL("**/admin/login");
  await expect(page.getByText("관리자 로그인")).toBeVisible();
});
