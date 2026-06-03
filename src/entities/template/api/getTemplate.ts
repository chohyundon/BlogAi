import { createClient } from "@/shared/api/supabase/client";
import { MAX_STORED_POSTS } from "@/entities/template/model/postLimit";

export const getTemplate = async (templateId: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", templateId)
    .single();
  if (error) console.error(error);
  return data;
};

export const getAllTemplates = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", user.id);
  if (error) console.error(error);
  return data ?? [];
};

export async function ensureUnderStoredPostLimit(): Promise<string> {
  const templates = await getAllTemplates();
  if (templates.length >= MAX_STORED_POSTS) {
    return "최대 10개의 포스트만 저장할 수 있습니다. 기존 글을 정리한 뒤 다시 시도해 주세요.";
  }
  return "";
}
