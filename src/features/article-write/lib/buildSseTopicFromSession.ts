import { buildUserPrompt } from "@/shared/lib/blogGenerationPrompt";
import {
  peekWriteGeneratingPayload,
  type WriteGeneratingPayload,
} from "@/features/article-write/lib/writeGeneratingSession";

export function buildSseTopicFromPayload(
  payload: WriteGeneratingPayload
): string | null {
  if (!payload.blogTitleValue.trim()) return null;
  return buildUserPrompt(
    payload.blogTitleValue,
    payload.blogDescriptionValue,
    payload.keywords
  );
}

export function getSseTopicFromSession(): string | null {
  const payload = peekWriteGeneratingPayload();
  if (!payload) return null;
  return buildSseTopicFromPayload(payload);
}
