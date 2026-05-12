/** OpenAI / Gemini API 라우트에서 공유하는 SSE·키워드·JSON 파싱 유틸 */

const isDev = process.env.NODE_ENV === "development";

export function normalizeKeywords(result: Record<string, unknown>): string[] {
  return Array.isArray(result.keywords)
    ? (result.keywords as unknown[]).map(String)
    : Array.isArray(result.hashtags)
      ? (result.hashtags as unknown[]).map(String)
      : [];
}

export function sseEncode(obj: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(obj)}\n\n`);
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

/** 프로덕션에서는 벤더/스택 정보를 숨기고, 개발 환경에서만 원문 노출 */
export function publicAiErrorMessage(error: unknown): string {
  if (isDev && error instanceof Error) {
    return error.message;
  }
  return "요청 처리 중 오류가 발생했습니다.";
}

export function isAiClientErrorMessage(message: string): boolean {
  return message.includes("400") || message.includes("Invalid");
}
