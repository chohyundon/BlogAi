const GEMINI_SSE_PATH = "/api/gemini";

export function buildGeminiSseUrl(topic: string): string {
  return `${GEMINI_SSE_PATH}?topic=${encodeURIComponent(topic)}`;
}
