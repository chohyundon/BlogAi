export const siteUrl = "https://www.blogai.store";
export const siteName = "BlogAi";
export const siteDescription =
  "BlogAi는 개발자를 위한 AI 기술 블로그 작성 도구입니다. TIL, 트러블슈팅, 딥다이브 템플릿으로 Markdown 글을 빠르게 완성하세요.";
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
