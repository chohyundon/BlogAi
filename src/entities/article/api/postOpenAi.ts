import type { PostArticleInput } from "../model/postArticleInput";

export const postOpenAi = async (data: PostArticleInput) => {
  const response = await fetch("/api/openai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (!response.ok) {
    const error = new Error(json?.error ?? "요청 실패") as Error & {
      status: number;
      details?: string;
    };
    error.status = response.status;
    error.details = json?.details;
    throw error;
  }
  return json;
};
