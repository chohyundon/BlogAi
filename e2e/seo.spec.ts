import { test, expect } from "@playwright/test";

test.describe("SEO 메타데이터", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("페이지 title이 개발자 특화 문구를 포함한다", async ({ page }) => {
    await expect(page).toHaveTitle(
      "BlogAi — 개발자를 위한 AI 기술 블로그 자동 생성"
    );
  });

  test("description 메타 태그가 개발자 특화 문구를 포함한다", async ({
    page,
  }) => {
    const description = await page
      .locator('meta[name="description"]')
      .getAttribute("content");

    expect(description).toContain("개발자");
    expect(description).toContain("기술 블로그");
    expect(description).toContain("AI");
  });

  test("keywords 메타 태그에 개발자 특화 키워드가 포함된다", async ({
    page,
  }) => {
    const keywords = await page
      .locator('meta[name="keywords"]')
      .getAttribute("content");

    expect(keywords).toContain("개발자 AI 블로그 자동 생성");
    expect(keywords).toContain("기술 블로그 AI 작성");
  });

  test("viewport 메타 태그가 존재한다", async ({ page }) => {
    const viewport = await page
      .locator('meta[name="viewport"]')
      .getAttribute("content");

    expect(viewport).toBe("width=device-width, initial-scale=1");
  });

  test("canonical 태그가 중복 없이 단 하나만 존재한다", async ({ page }) => {
    const canonicals = page.locator('link[rel="canonical"]');

    await expect(canonicals).toHaveCount(1);
  });

  test("og:title이 페이지 title과 일치한다", async ({ page }) => {
    const ogTitle = await page
      .locator('meta[property="og:title"]')
      .getAttribute("content");
    const title = await page.title();

    expect(ogTitle).toBe(title);
  });

  test("og:description이 description과 일치한다", async ({ page }) => {
    const ogDesc = await page
      .locator('meta[property="og:description"]')
      .getAttribute("content");
    const desc = await page
      .locator('meta[name="description"]')
      .getAttribute("content");

    expect(ogDesc).toBe(desc);
  });
});

test.describe("sitemap.xml", () => {
  test("sitemap.xml이 정상 응답한다", async ({ page }) => {
    const response = await page.goto("/sitemap.xml");

    expect(response?.status()).toBe(200);
  });

  test("sitemap에 루트 URL이 포함된다", async ({ page }) => {
    await page.goto("/sitemap.xml");
    const content = await page.content();

    expect(content).toContain("<loc>https://www.blogai.store</loc>");
  });

  test("sitemap에 example 페이지들이 포함된다", async ({ page }) => {
    await page.goto("/sitemap.xml");
    const content = await page.content();

    expect(content).toContain("/example/TIL");
    expect(content).toContain("/example/Trouble_Shooting");
    expect(content).toContain("/example/Deep_Dive");
  });
});
