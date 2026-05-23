"use client";

import { useEffect, useRef, useState } from "react";
import type { GeneratedArticle } from "@/entities/article/model/generatedArticle";
import type { PostArticleInput } from "@/entities/article/model/postArticleInput";
import { extractMarkdownPreviewFromJsonStream } from "@/features/article-write/lib/extractMarkdownPreviewFromJsonStream";

export type ArticleGenerationStatus =
  | "연결 시도 중..."
  | "연결됨"
  | "완료"
  | "에러";

type StreamArticlePayload = {
  title: string;
  content: string;
  keywords: string[];
  metaDescription?: string;
};

function aiEndpoint(): "/api/openai" | "/api/gemini" {
  if (process.env.NEXT_PUBLIC_AI_PROVIDER === "gemini") {
    return "/api/gemini";
  }
  return "/api/openai";
}

function parseSseBlock(block: string): { event: string; data: string } {
  let event = "message";
  const dataLines: string[] = [];

  for (const line of block.split("\n")) {
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trimStart());
    }
  }

  return { event, data: dataLines.join("\n") };
}

export function useArticleGenerationStream(
  payload: PostArticleInput | null,
  templateKey: string
) {
  const [preview, setPreview] = useState("");
  const [article, setArticle] = useState<GeneratedArticle | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] =
    useState<ArticleGenerationStatus>("연결 시도 중...");
  const rawRef = useRef("");
  const articleRef = useRef<GeneratedArticle | null>(null);

  useEffect(() => {
    if (!payload) {
      setError("작성 정보가 없습니다.");
      setStatus("에러");
      return;
    }

    const controller = new AbortController();
    rawRef.current = "";
    articleRef.current = null;
    setPreview("");
    setArticle(null);
    setError("");
    setStatus("연결 시도 중...");

    const run = async () => {
      try {
        const useStream =
          process.env.NEXT_PUBLIC_AI_PROVIDER === "gemini" ||
          !process.env.NEXT_PUBLIC_AI_PROVIDER;

        if (!useStream) {
          const res = await fetch(aiEndpoint(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });

          if (!res.ok) {
            const json = (await res.json().catch(() => ({}))) as {
              error?: string;
            };
            throw new Error(json.error ?? `HTTP ${res.status}`);
          }

          const parsed = (await res.json()) as StreamArticlePayload;
          const nextArticle: GeneratedArticle = {
            title: parsed.title,
            content: String(parsed.content ?? ""),
            keywords: Array.isArray(parsed.keywords)
              ? parsed.keywords.map(String)
              : [],
            template: templateKey,
          };
          articleRef.current = nextArticle;
          setArticle(nextArticle);
          setPreview(nextArticle.content);
          setStatus("완료");
          return;
        }

        const res = await fetch(aiEndpoint(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!res.ok) {
          const json = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(json.error ?? `HTTP ${res.status}`);
        }

        if (!res.body) {
          throw new Error("스트림 응답을 받지 못했습니다.");
        }

        setStatus("연결됨");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let streamFailed = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const blocks = buffer.split("\n\n");
          buffer = blocks.pop() ?? "";

          for (const block of blocks) {
            if (!block.trim()) continue;

            const { event, data } = parseSseBlock(block);

            if (event === "chunk") {
              rawRef.current += data;
              const markdown = extractMarkdownPreviewFromJsonStream(
                rawRef.current
              );
              setPreview(markdown || rawRef.current);
              continue;
            }

            if (event === "result") {
              const parsed = JSON.parse(data) as StreamArticlePayload;
              const nextArticle: GeneratedArticle = {
                title: parsed.title,
                content: parsed.content,
                keywords: parsed.keywords,
                template: templateKey,
              };
              articleRef.current = nextArticle;
              setArticle(nextArticle);
              setPreview(parsed.content);
              continue;
            }

            if (event === "error") {
              streamFailed = true;
              setError(data || "글 생성에 실패했습니다.");
              setStatus("에러");
              continue;
            }

            if (event === "done") {
              setStatus(streamFailed ? "에러" : "완료");
            }
          }
        }

        if (!streamFailed && !articleRef.current && rawRef.current) {
          const parsed = JSON.parse(rawRef.current) as StreamArticlePayload;
          const nextArticle: GeneratedArticle = {
            title: parsed.title,
            content: parsed.content,
            keywords: parsed.keywords,
            template: templateKey,
          };
          articleRef.current = nextArticle;
          setArticle(nextArticle);
          setPreview(parsed.content);
          setStatus("완료");
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(
          err instanceof Error ? err.message : "글 생성에 실패했습니다."
        );
        setStatus("에러");
      }
    };

    void run();

    return () => controller.abort();
  }, [payload, templateKey]);

  return { preview, article, error, status };
}
