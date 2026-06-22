"use client";

import { Lightbulb } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Button from "@/shared/ui/Button";
import { BottomCtaProps } from "@/features/article-write/model/BottomCtaType";
import {
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
  const hasPayload =
    generationStatus === "error" && Boolean(peekWriteGeneratingPayload());

  const handleGenerateArticle = async () => {
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
    grantGeneratingPageEntry();
    setGenerationStatus("generating");
    router.push("/write/generating");
  };

  const helperText =
    generationStatus === "generating"
      ? "글 생성 중입니다. 버튼을 눌러 생성 화면으로 이동하세요."
      : generationStatus === "done"
      ? "생성이 완료되었습니다. 버튼을 눌러 결과를 확인하세요."
      : hasPayload
      ? "생성 중 오류가 발생했습니다. 버튼을 눌러 다시 확인하세요."
      : `저장 가능: 포스트 최대 ${MAX_STORED_POSTS}개까지. 생성 후 자동으로 저장됩니다.`;

  const buttonLabel =
    generationStatus === "generating"
      ? "생성 화면으로 이동"
      : generationStatus === "done"
      ? "생성 결과 보기"
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
        <Button
          onClick={handleGenerateArticle}
          className="font-bold shadow-lg  bg-amber-500 hover:bg-amber-600 transition-all text-white">
          {buttonLabel}
        </Button>
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
