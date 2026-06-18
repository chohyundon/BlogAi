import { createClient } from "@/shared/api/supabase/client";
import { Provider } from "@supabase/supabase-js";

export const SocialLogin = async (provider: string) => {
  const supabase = createClient();

  const { data } = await supabase.auth.signInWithOAuth({
    provider: provider as Provider,
  });

  return data;
};
