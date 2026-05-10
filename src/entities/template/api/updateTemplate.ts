import { DatabaseDocument } from "@/shared/types/database";
import { createClient } from "@/shared/api/supabase/client";

export const updateTemplate = async (
  templateId: string,
  template: DatabaseDocument
) => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("posts")
    .update(template)
    .eq("id", templateId);
  if (error) console.error(error);
  return error;
};
