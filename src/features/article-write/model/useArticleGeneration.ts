"use client";

import { useEffect, useState } from "react";
import type { GeneratedArticle } from "@/entities/article/model/generatedArticle";
import type { PostArticleInput } from "@/entities/article/model/postArticleInput";

type ArticleGenerationResponse = {
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

export function useArticleGeneration(
  payload: PostArticleInput | null,
  templateKey: string
) {
  const [article, setArticle] = useState<GeneratedArticle | null>(null);
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!payload) {
      setError("작성 정보가 없습니다.");
      setIsGenerating(false);
      return;
    }

    const controller = new AbortController();
    setArticle(null);
    setError("");
    setIsGenerating(true);

    const run = async () => {
      try {
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

        const parsed = (await res.json()) as ArticleGenerationResponse;
        setArticle({
          title: parsed.title,
          content: String(parsed.content ?? ""),
          keywords: Array.isArray(parsed.keywords)
            ? parsed.keywords.map(String)
            : [],
          template: templateKey,
        });
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(
          err instanceof Error ? err.message : "글 생성에 실패했습니다."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsGenerating(false);
        }
      }
    };

    void run();

    return () => controller.abort();
  }, [payload, templateKey]);

  return { article, error, isGenerating };
}
