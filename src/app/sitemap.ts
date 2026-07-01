import type { MetadataRoute } from "next";
import { siteUrl } from "@/shared/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl;
  const lastModified = new Date();

  return [
    {
      url: base,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/example`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/example/TIL`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/example/Trouble_Shooting`,
      lastModified,
      priority: 0.7,
      changeFrequency: "monthly",
    },
    {
      url: `${base}/example/Deep_Dive`,
      lastModified,
      priority: 0.7,
      changeFrequency: "monthly",
    },
  ];
}
