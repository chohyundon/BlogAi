export const siteUrl = "https://www.blogai.store";
export const siteName = "BlogAi";
export const siteDescription =
  "개발자를 위한 AI 기술 블로그 자동 생성 서비스. TIL, 트러블슈팅, 심층 분석 등 기술 블로그 글을 키워드 하나로 AI가 자동 작성합니다.";
export const siteKeywords = [
  "BlogAi",
  "BlogAI",
  "blogai.store",
  "AI 블로그",
  "기술 블로그",
  "개발자 블로그",
  "개발자 AI 블로그 자동 생성",
  "기술 블로그 AI 작성",
  "AI TIL 블로그",
  "개발 블로그 자동화",
  "블로그 글쓰기",
];
export const ogImage = "/opengraph-image";

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: siteName,
      alternateName: ["BlogAI", "blogai.store"],
      description: siteDescription,
      inLanguage: "ko-KR",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: siteName,
      alternateName: ["BlogAI"],
      url: siteUrl,
      logo: `${siteUrl}${ogImage}`,
    },
  ],
};
