import type { GeneratedArticle } from "@/entities/article/model/generatedArticle";
import { postTemplate } from "@/entities/template/api/postTemplate";
import { ensureUnderStoredPostLimit } from "@/entities/template/api/getTemplate";
import {
  MAX_STORED_POSTS,
  StoredPostLimitError,
} from "@/entities/template/model/postLimit";
import { clearWriteGeneratingPayload } from "@/features/article-write/lib/writeGeneratingSession";

export type SaveGeneratedArticleResult = {
  postId?: string;
};

export function formatStoredPostLimitMessage(): string {
  return `저장된 포스트가 ${MAX_STORED_POSTS}개 한도에 도달했습니다. 기존 포스트를 삭제한 후 다시 시도해주세요.`;
}

export function formatSaveErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (error instanceof StoredPostLimitError) {
    return formatStoredPostLimitMessage();
  }
  return error instanceof Error ? error.message : fallback;
}

export async function saveGeneratedArticle(
  article: GeneratedArticle,
  templateType: string,
  options?: { signal?: AbortSignal }
): Promise<SaveGeneratedArticleResult> {
  const { signal } = options ?? {};

  if (signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }

  const limitError = await ensureUnderStoredPostLimit();
  if (limitError) {
    throw new Error(limitError);
  }

  if (signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }

  const saveResult = await postTemplate(
    {
      title: article.title,
      content: article.content,
      keywords: article.keywords,
      template_type: templateType,
    },
    { signal }
  );

  clearWriteGeneratingPayload();

  const postId =
    saveResult && Array.isArray(saveResult) && saveResult.length > 0
      ? String(saveResult[0].id)
      : undefined;

  return { postId };
}
