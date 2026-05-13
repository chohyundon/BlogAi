import type { PostArticleInput } from "../model/postArticleInput";
import { ensureUnderStoredPostLimit } from "@/entities/template/api/getTemplate";

function endpoint(): "/api/openai" | "/api/gemini" {
  if (process.env.NEXT_PUBLIC_AI_PROVIDER === "gemini") {
    return "/api/gemini";
  }
  return "/api/openai";
}

export interface StreamEvent {
  type: "delta" | "complete" | "error";
  data: any;
}

export async function postArticleStream(
  data: PostArticleInput,
  onEvent: (event: StreamEvent) => void
): Promise<void> {
  await ensureUnderStoredPostLimit();

  const response = await fetch(endpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...data,
      stream: true, // SSE 스트림 요청
    }),
  });

  if (!response.ok) {
    const json = (await response.json()) as { error?: string };
    throw new Error(json.error ?? `HTTP ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Response body is not readable");
  }

  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          const eventType = line.slice(7).trim();
          continue;
        }
        
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          
          if (data === '[DONE]') {
            return;
          }

          try {
            const parsed = JSON.parse(data);
            
            // SSE 이벤트에 따라 분기
            const eventLine = lines.find(l => l.startsWith('event: '));
            const eventType = eventLine ? eventLine.slice(7).trim() : 'delta';
            
            onEvent({
              type: eventType as StreamEvent['type'],
              data: parsed,
            });

            if (eventType === 'complete' || eventType === 'error') {
              return;
            }
          } catch (error) {
            console.warn('Failed to parse SSE data:', data, error);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}