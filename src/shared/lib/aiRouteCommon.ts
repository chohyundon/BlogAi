/** OpenAI / Gemini API 라우트에서 공유하는 키워드·JSON 파싱 유틸 */

export function normalizeKeywords(result: Record<string, unknown>): string[] {
  return Array.isArray(result.keywords)
    ? (result.keywords as unknown[]).map(String)
    : Array.isArray(result.hashtags)
      ? (result.hashtags as unknown[]).map(String)
      : [];
}

export function parseModelJsonOutput(trimmed: string): Record<string, unknown> {
  if (!trimmed) return {};
  try {
    return JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    return {
      title: "",
      content: trimmed,
      keywords: [],
      metaDescription: "",
    };
  }
}

export function isAiClientErrorMessage(message: string): boolean {
  return message.includes("400") || message.includes("Invalid");
}
