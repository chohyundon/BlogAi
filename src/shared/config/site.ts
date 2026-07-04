export const siteUrl = "https://www.blogai.store";
export const siteName = "BlogAi";
export const siteDescription =
  "BlogAi는 키워드 기반으로 블로그 글을 생성하고, 제목과 본문 초안을 빠르게 작성할 수 있는 AI 글쓰기 서비스입니다.";
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
