import { createClient } from "@/shared/api/supabase/server";

export type PostSeoData = {
  title: string;
  content: string;
  keywords: string[] | null;
  template_type: string;
  created_at: string;
};

export async function getPostForSeo(
  postId: string
): Promise<PostSeoData | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("posts")
      .select("title, content, keywords, template_type, created_at")
      .eq("id", postId)
      .single();

    return data;
  } catch {
    return null;
  }
}
