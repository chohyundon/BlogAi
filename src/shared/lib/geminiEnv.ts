export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

/** Gemini API 키 (서버 전용 env 우선, 마이그레이션용 fallback 포함) */
export function getGeminiApiKey(): string | undefined {
  return (
    process.env.GEMINI_API_KEY ??
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ??
    process.env.GEMINI_APT_KEY
  );
}

export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL;
}
