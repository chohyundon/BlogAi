import { createBrowserClient } from "@supabase/ssr";

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  if (!browserClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

    if (!url?.trim() || !anonKey?.trim()) {
      throw new Error(
        "NEXT_PUBLIC_SUPABASE_URL과 anon 키가 필요합니다. .env에 NEXT_PUBLIC_SUPABASE_ANON_KEY 또는 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY를 설정하세요."
      );
    }

    browserClient = createBrowserClient(url, anonKey);
  }
  return browserClient;
}
