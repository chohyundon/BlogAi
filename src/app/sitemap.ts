import type { MetadataRoute } from "next";
import { siteUrl } from "@/shared/config/site";
import { createClient } from "@/shared/api/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl;
  const lastModified = new Date();

  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("id, created_at")
    .order("created_at", { ascending: false });

  const postUrls: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    url: `${base}/post/${post.id}`,
    lastModified: new Date(post.created_at),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

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
    ...postUrls,
  ];
}
