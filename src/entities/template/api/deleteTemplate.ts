import { createClient } from "@/shared/api/supabase/client";

export const deleteTemplate = async (templateId: string) => {
  const supabase = await createClient();

  const { error } = await supabase.from("posts").delete().eq("id", templateId);
  if (error) console.error(error);
  return error;
};
