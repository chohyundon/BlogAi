"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import type { GeneratedArticle } from "@/entities/article/model/generatedArticle";
import { StoredPostLimitError } from "@/entities/template/model/postLimit";
import {
  peekWriteGeneratingPayload,
  type WriteGeneratingPayload,
} from "@/features/article-write/lib/writeGeneratingSession";
import {
  formatSaveErrorMessage,
  formatStoredPostLimitMessage,
  saveGeneratedArticle,
} from "@/features/article-write/lib/saveGeneratedArticle";
import { useArticleGeneration } from "@/features/article-write/model/useArticleGeneration";
import type { GeneratingDraftPhase } from "@/features/article-write/model/generatingDraftPhase";

export function useGeneratingDraft() {
  const router = useRouter();
  const [payload] = useState<WriteGeneratingPayload | null>(() =>
    peekWriteGeneratingPayload()
  );
  const [phase, setPhase] = useState<GeneratingDraftPhase>("loading");
  const [generatedArticle, setGeneratedArticle] =
    useState<GeneratedArticle | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const saveStartedRef = useRef(false);

  const { article, error: generationError } = useArticleGeneration(
    payload,
    payload?.selectedTemplate ?? ""
  );

  const navigateAfterSave = useCallback(
    (postId?: string) => {
      toast.success("글이 성공적으로 저장되었습니다!");
      router.push(postId ? `/post/${postId}` : "/mypage");
    },
    [router]
  );

  useEffect(() => {
    if (!payload) {
      toast.warning("작성 정보가 없습니다. 다시 입력해 주세요.");
      router.replace("/write");
      return;
    }

    if (generationError) {
      setPhase("error");
      setErrorMessage(generationError);
    }
  }, [payload, router, generationError]);

  useEffect(() => {
    if (!article || !payload || saveStartedRef.current) return;

    saveStartedRef.current = true;
    setGeneratedArticle(article);

    const runAutoSave = async () => {
      try {
        setPhase("saving");
        const { postId } = await saveGeneratedArticle(
          article,
          payload.selectedTemplate
        );
        navigateAfterSave(postId);
      } catch (error) {
        setPhase("error");
        setErrorMessage(
          formatSaveErrorMessage(error, "글 생성 또는 저장에 실패했습니다.")
        );
      }
    };

    void runAutoSave();
  }, [article, payload, navigateAfterSave]);

  const handleSave = async () => {
    if (!generatedArticle) return;

    const sessionPayload = peekWriteGeneratingPayload();
    if (!sessionPayload) return;

    try {
      setPhase("saving");
      const { postId } = await saveGeneratedArticle(
        generatedArticle,
        sessionPayload.selectedTemplate
      );
      navigateAfterSave(postId);
    } catch (error) {
      setPhase("done");

      if (error instanceof StoredPostLimitError) {
        toast.error(formatStoredPostLimitMessage());
      } else {
        const errorMsg = formatSaveErrorMessage(error, "저장에 실패했습니다.");
        toast.error(`저장 실패: ${errorMsg}`);
      }
    }
  };

  const handleRegenerate = () => {
    router.push("/write");
  };

  return {
    payload,
    phase,
    generatedArticle,
    errorMessage,
    handleSave,
    handleRegenerate,
  };
}
