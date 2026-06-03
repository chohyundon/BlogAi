import { createClient } from "@/shared/api/supabase/client";

export async function updatePost(
  postId: string,
  content: string,
  title: string
) {
  const supabase = createClient();

  const { error } = await supabase
    .from("posts")
    .update({ content: content.trim(), title: title.trim() })
    .eq("id", postId)
    .select();
  if (error) {
    throw new Error(error.message);
  }
}
