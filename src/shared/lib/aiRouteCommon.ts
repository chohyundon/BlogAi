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

/** SSE 스트림 인코딩 함수 */
export function sseEncode(event: string, data: string): string {
  return `event: ${event}\ndata: ${data}\n\n`;
}

/** 사용자에게 노출할 에러 메시지 생성 */
export function publicAiErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (isAiClientErrorMessage(message)) {
    return "요청이 올바르지 않습니다. 입력을 확인해 주세요.";
  }
  return "글 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.";
}