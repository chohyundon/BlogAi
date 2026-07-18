import { test, expect } from "@playwright/test";

const FIXTURE_URL = "/test-fixtures/error-boundary";

test.describe("ErrorBoundary", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FIXTURE_URL);
  });

  test("초기 렌더링 시 정상 컴포넌트가 표시된다", async ({ page }) => {
    await expect(page.getByTestId("stable-content")).toBeVisible();
    await expect(page.getByTestId("error-boundary-fallback")).not.toBeVisible();
  });

  test("에러 발생 시 fallback UI가 표시된다", async ({ page }) => {
    await page.getByTestId("trigger-error").click();

    await expect(page.getByTestId("error-boundary-fallback")).toBeVisible();
  });

  test("에러 메시지가 fallback UI에 표시된다", async ({ page }) => {
    await page.getByTestId("trigger-error").click();

    await expect(page.getByTestId("error-boundary-fallback")).toContainText(
      "테스트용 컴포넌트 에러"
    );
  });

  test("다시 시도 버튼 클릭 시 정상 상태로 복구된다", async ({ page }) => {
    await page.getByTestId("trigger-error").click();
    await expect(page.getByTestId("error-boundary-fallback")).toBeVisible();

    await page.getByTestId("error-boundary-reset").click();

    await expect(page.getByTestId("stable-content")).toBeVisible();
    await expect(page.getByTestId("error-boundary-fallback")).not.toBeVisible();
  });

  test("복구 후 다시 에러를 발생시킬 수 있다", async ({ page }) => {
    await page.getByTestId("trigger-error").click();
    await page.getByTestId("error-boundary-reset").click();
    await expect(page.getByTestId("stable-content")).toBeVisible();

    await page.getByTestId("trigger-error").click();
    await expect(page.getByTestId("error-boundary-fallback")).toBeVisible();
  });

  test("에러 바운더리 외부 UI는 영향을 받지 않는다", async ({ page }) => {
    await page.getByTestId("trigger-error").click();

    await expect(page.getByTestId("trigger-error")).toBeVisible();
  });
});
