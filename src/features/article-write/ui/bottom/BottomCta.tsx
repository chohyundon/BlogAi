"use client";

import { Lightbulb } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Button from "@/shared/ui/Button";
import { BottomCtaProps } from "@/features/article-write/model/BottomCtaType";
import {
  clearWriteGeneratingPayload,
  grantGeneratingPageEntry,
  peekWriteGeneratingPayload,
  saveWriteGeneratingPayload,
  setGenerationStatus,
} from "@/features/article-write/lib/writeGeneratingSession";
import { useGenerationStatus } from "@/features/article-write/model/useGenerationStatus";
import { ensureUnderStoredPostLimit } from "@/entities/template/api/getTemplate";
import { MAX_STORED_POSTS } from "@/entities/template/model/postLimit";

export default function BottomCta({
  selectedTemplate,
  blogTitleValue,
  blogDescriptionValue,
  keywords,
}: BottomCtaProps) {
  const router = useRouter();
  const generationStatus = useGenerationStatus();
  const hasStoredPayload = Boolean(peekWriteGeneratingPayload());
  const hasPayload = generationStatus === "error" && hasStoredPayload;
  const isGeneratingInProgress = generationStatus === "generating";
  const isGenerationDone = generationStatus === "done";
  const canGoToGeneratingPage =
    isGeneratingInProgress || isGenerationDone || hasPayload;

  const handleGoToGenerating = () => {
    if (!peekWriteGeneratingPayload()) {
      toast.warning("작성 정보가 없습니다. 다시 입력해 주세요.");
      return;
    }
    grantGeneratingPageEntry();
    router.push("/write/generating");
  };

  const handleStartNewDraft = () => {
    clearWriteGeneratingPayload();
  };

  const handleGenerateArticle = async () => {
    if (canGoToGeneratingPage) {
      handleGoToGenerating();
      return;
    }

    if (blogTitleValue.trim() === "" || blogDescriptionValue.trim() === "") {
      toast.warning("블로그 제목 아이디어, 상세 설명을 입력해 주세요.");
      return;
    }

    try {
      const errorMessage = await ensureUnderStoredPostLimit();
      if (errorMessage) {
        toast.error(errorMessage);
        return;
      }
    } catch (error) {
      toast.error(error as string);
      return;
    }

    saveWriteGeneratingPayload({
      selectedTemplate,
      blogTitleValue,
      blogDescriptionValue,
      keywords,
    });
    setGenerationStatus("generating");
    handleGoToGenerating();
  };

  const helperText = isGeneratingInProgress
    ? "글 생성 중입니다. 버튼을 눌러 생성 화면으로 이동하세요."
    : isGenerationDone
      ? "생성이 완료되었습니다. 결과를 확인하거나 새 글을 작성할 수 있습니다."
      : hasPayload
        ? "생성 중 오류가 발생했습니다. 버튼을 눌러 다시 확인하세요."
        : `저장 가능: 포스트 최대 ${MAX_STORED_POSTS}개까지. 생성 후 자동으로 저장됩니다.`;

  const buttonLabel = isGeneratingInProgress
    ? "생성 화면으로 이동"
    : hasPayload
      ? "생성 화면으로 이동"
      : "AI 글 생성하기";

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-xl border border-amber-500/30 bg-amber-500/5">
        <div className="flex items-center gap-3">
          <Lightbulb className="size-8 text-amber-400" />
          <div>
            <p className="text-white font-bold leading-none">
              생성할 준비가 되셨나요?
            </p>
            <p className="text-slate-400 text-sm mt-1">{helperText}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {isGenerationDone ? (
            <>
              <Button
                onClick={handleGoToGenerating}
                className="font-bold shadow-lg bg-amber-500 hover:bg-amber-600 transition-all text-white">
                생성 결과 보기
              </Button>
              <Button
                onClick={handleStartNewDraft}
                className="font-bold border border-slate-500 bg-slate-800/80 hover:bg-slate-700 transition-all text-white">
                새 글 생성하기
              </Button>
            </>
          ) : (
            <Button
              onClick={handleGenerateArticle}
              className="font-bold shadow-lg bg-amber-500 hover:bg-amber-600 transition-all text-white">
              {buttonLabel}
            </Button>
          )}
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="dark"
      />
    </>
  );
}
