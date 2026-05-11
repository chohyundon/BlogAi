import { postGemini } from "./postGemini";
import { postOpenAi } from "./postOpenAi";
import type { PostArticleInput } from "../model/postArticleInput";

export type { PostArticleInput } from "../model/postArticleInput";

/** `.env`에 `NEXT_PUBLIC_AI_PROVIDER=gemini`면 Gemini, 그 외 OpenAI */
export function postArticle(data: PostArticleInput) {
  if (process.env.NEXT_PUBLIC_AI_PROVIDER === "gemini") {
    return postGemini(data);
  }
  return postOpenAi(data);
}

export { postArticleStream } from "./postArticleStream";
export type { ArticleStreamDelta } from "./postArticleStream";
