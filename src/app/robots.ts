import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/mypage", "/write"],
    },
    sitemap: "https://www.blogai.store/sitemap.xml",
  };
}
