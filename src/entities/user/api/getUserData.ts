"use server";

import { createClient } from "@/shared/api/supabase/server";

export const getUserData = async (userId: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", userId);
  if (error) {
    console.error(error);
  }
  return data;
};
