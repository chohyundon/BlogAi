import type { GeneratedArticle } from "@/entities/article/model/generatedArticle";
import { extractPartialJsonStringValue } from "@/shared/lib/extractPartialJsonStringValue";
import type { PostArticleInput } from "../model/postArticleInput";

export type ArticleStreamDelta = {
  title: string;
  content: string;
};

type StreamDonePayload = {
  title?: string;
  content?: string;
  keywords?: unknown;
};

type PostArticleStreamOptions = {
  onDelta: (preview: ArticleStreamDelta) => void;
};

function streamEndpoint(): "/api/openai" | "/api/gemini" {
  if (process.env.NEXT_PUBLIC_AI_PROVIDER === "gemini") {
    return "/api/gemini";
  }
  return "/api/openai";
}

export async function postArticleStream(
  data: PostArticleInput,
  options: PostArticleStreamOptions
): Promise<GeneratedArticle> {
  const res = await fetch(streamEndpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, stream: true }),
  });

  const contentType = res.headers.get("content-type") ?? "";

  if (!res.ok) {
    if (contentType.includes("application/json")) {
      const json = (await res.json()) as {
        error?: string;
        details?: string;
      };
      const err = new Error(json.error ?? "요청 실패") as Error & {
        status: number;
        details?: string;
      };
      err.status = res.status;
      err.details = json.details;
      throw err;
    }
    throw new Error(await res.text());
  }

  if (!res.body) {
    throw new Error("응답 본문이 없습니다.");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let lineBuffer = "";
  let accumulated = "";
  const streamDone: { payload: StreamDonePayload | null } = { payload: null };

  const emitPreview = () => {
    const title = extractPartialJsonStringValue(accumulated, "title") ?? "";
    const content = extractPartialJsonStringValue(accumulated, "content") ?? "";
    options.onDelta({ title, content });
  };

  const handleSseLine = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) return;
    const rawJson = trimmed.slice(5).trim();
    let msg: {
      type?: string;
      chunk?: string;
      message?: string;
      title?: string;
      content?: string;
      keywords?: unknown;
    };
    try {
      msg = JSON.parse(rawJson) as typeof msg;
    } catch {
      return;
    }

    if (msg.type === "delta" && typeof msg.chunk === "string") {
      accumulated += msg.chunk;
      emitPreview();
    }

    if (msg.type === "done") {
      streamDone.payload = {
        title: msg.title,
        content: msg.content,
        keywords: msg.keywords,
      };
    }

    if (msg.type === "error") {
      throw new Error(msg.message ?? "스트림 오류");
    }
  };

  const handleSseBlock = (block: string) => {
    for (const line of block.split("\n")) {
      handleSseLine(line);
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    lineBuffer += decoder.decode(value, { stream: true });

    const segments = lineBuffer.split("\n\n");
    lineBuffer = segments.pop() ?? "";

    for (const segment of segments) {
      handleSseBlock(segment);
    }
  }

  decoder.decode();
  if (lineBuffer.trim()) {
    handleSseBlock(lineBuffer);
  }

  if (!streamDone.payload) {
    throw new Error("스트림이 완료되기 전에 끊겼습니다.");
  }

  const donePayload = streamDone.payload;
  const rawKw = donePayload.keywords;
  const keywordsArray = Array.isArray(rawKw)
    ? rawKw.map((k) => String(k))
    : typeof rawKw === "string"
    ? rawKw
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    : [];

  return {
    title: String(streamDone.payload.title ?? ""),
    content: String(streamDone.payload.content ?? ""),
    keywords: keywordsArray,
    template: data.selectedTemplate,
  };
}
