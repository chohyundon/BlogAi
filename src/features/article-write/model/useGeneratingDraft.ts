"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useAuthStore } from "@/features/auth/model/AuthStore";
import { invalidateUserData } from "@/entities/user/api/queryUserData";
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

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export function useGeneratingDraft() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [payload] = useState<WriteGeneratingPayload | null>(() =>
    peekWriteGeneratingPayload()
  );
  const [phase, setPhase] = useState<GeneratingDraftPhase>("loading");
  const [generatedArticle, setGeneratedArticle] =
    useState<GeneratedArticle | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const saveStartedRef = useRef(false);
  const activeSaveAbortRef = useRef<AbortController | null>(null);

  const { article, error: generationError } = useArticleGeneration(
    payload,
    payload?.selectedTemplate ?? ""
  );

  const navigateAfterSave = useCallback(
    async (postId?: string, signal?: AbortSignal) => {
      if (signal?.aborted) return;
      if (user?.id) {
        await invalidateUserData(queryClient, user.id);
      }
      toast.success("글이 성공적으로 저장되었습니다!");
      router.push(postId ? `/post/${postId}` : "/mypage");
    },
    [router, queryClient, user?.id]
  );

  useEffect(() => {
    return () => {
      activeSaveAbortRef.current?.abort();
    };
  }, []);

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

    const controller = new AbortController();
    activeSaveAbortRef.current = controller;

    const runAutoSave = async () => {
      try {
        setPhase("saving");
        const { postId } = await saveGeneratedArticle(
          article,
          payload.selectedTemplate,
          { signal: controller.signal }
        );
        await navigateAfterSave(postId, controller.signal);
      } catch (error) {
        if (isAbortError(error) || controller.signal.aborted) return;
        setPhase("error");
        setErrorMessage(
          formatSaveErrorMessage(error, "글 생성 또는 저장에 실패했습니다.")
        );
      } finally {
        if (activeSaveAbortRef.current === controller) {
          activeSaveAbortRef.current = null;
        }
      }
    };

    void runAutoSave();

    return () => controller.abort();
  }, [article, payload, navigateAfterSave]);

  const handleSave = async () => {
    if (!generatedArticle) return;

    const sessionPayload = peekWriteGeneratingPayload();
    if (!sessionPayload) return;

    const controller = new AbortController();
    activeSaveAbortRef.current = controller;

    try {
      setPhase("saving");
      const { postId } = await saveGeneratedArticle(
        generatedArticle,
        sessionPayload.selectedTemplate,
        { signal: controller.signal }
      );
      await navigateAfterSave(postId, controller.signal);
    } catch (error) {
      if (isAbortError(error) || controller.signal.aborted) return;

      setPhase("done");

      if (error instanceof StoredPostLimitError) {
        toast.error(formatStoredPostLimitMessage());
      } else {
        const errorMsg = formatSaveErrorMessage(error, "저장에 실패했습니다.");
        toast.error(`저장 실패: ${errorMsg}`);
      }
    } finally {
      if (activeSaveAbortRef.current === controller) {
        activeSaveAbortRef.current = null;
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
