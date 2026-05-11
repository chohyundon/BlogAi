"use server";

import { createClient } from "@/shared/api/supabase/server";

export async function deleteTemplate(
  templateId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "인증이 필요합니다. 다시 로그인해 주세요." };
  }

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", templateId)
    .eq("user_id", user.id);

  if (error) {
    console.error(error);
    return { error: error.message };
  }

  return { error: null };
}
