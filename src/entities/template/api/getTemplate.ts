import { createClient } from "@/shared/api/supabase/client";

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

  const { data, error } = await supabase.from("posts").select("*");
  if (error) console.error(error);
  return data;
};
