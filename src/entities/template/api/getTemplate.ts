import { createClient } from "@/shared/api/supabase/client";
import {
  isAtStoredPostLimit,
  StoredPostLimitError,
} from "@/entities/template/model/postLimit";

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

/** 현재 로그인 사용자의 글만 조회(한도·작성 플로우용). 비로그인 시 빈 배열 */
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

export async function ensureUnderStoredPostLimit(): Promise<void> {
  const templates = await getAllTemplates();
  if (isAtStoredPostLimit(templates.length)) {
    throw new StoredPostLimitError();
  }
}
