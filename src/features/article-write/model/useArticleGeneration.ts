"use client";

import { useEffect, useState } from "react";
import type { GeneratedArticle } from "@/entities/article/model/generatedArticle";
import type { PostArticleInput } from "@/entities/article/model/postArticleInput";
import {
  getGenerationStatus,
  peekGenerationResult,
  saveGenerationResult,
  setGenerationStatus,
} from "@/features/article-write/lib/writeGeneratingSession";

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

    if (getGenerationStatus() === "done") {
      const cached = peekGenerationResult();
      if (cached) {
        setArticle(cached);
        setError("");
        setIsGenerating(false);
        return;
      }
    }

    setArticle(null);
    setError("");
    setIsGenerating(true);
    setGenerationStatus("generating");

    const run = async () => {
      try {
        const res = await fetch(aiEndpoint(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const json = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(json.error ?? `HTTP ${res.status}`);
        }

        const parsed = (await res.json()) as ArticleGenerationResponse;
        const generated: GeneratedArticle = {
          title: parsed.title,
          content: String(parsed.content ?? ""),
          keywords: Array.isArray(parsed.keywords)
            ? parsed.keywords.map(String)
            : [],
          template: templateKey,
        };
        setArticle(generated);
        saveGenerationResult(generated);
        setGenerationStatus("done");
      } catch (err) {
        setGenerationStatus("error");
        setError(
          err instanceof Error ? err.message : "글 생성에 실패했습니다."
        );
      } finally {
        setIsGenerating(false);
      }
    };

    run();
  }, [payload, templateKey]);

  return { article, error, isGenerating };
}
