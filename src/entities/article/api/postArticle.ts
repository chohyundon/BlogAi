import type { GeneratedArticle } from "@/entities/article/model/generatedArticle";
import { ensureUnderStoredPostLimit } from "@/entities/template/api/getTemplate";
import type { PostArticleInput } from "../model/postArticleInput";

function endpoint(): "/api/openai" | "/api/gemini" {
  if (process.env.NEXT_PUBLIC_AI_PROVIDER === "gemini") {
    return "/api/gemini";
  }
  return "/api/openai";
}

export async function postArticle(
  data: PostArticleInput
): Promise<GeneratedArticle> {
  await ensureUnderStoredPostLimit();

  const res = await fetch(endpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const json = (await res.json()) as { error?: string };
    throw new Error(json.error ?? `HTTP ${res.status}`);
  }

  return (await res.json()) as GeneratedArticle;
}
