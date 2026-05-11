"use client";

import { Lightbulb } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Button from "@/shared/ui/Button";
import { BottomCtaProps } from "@/features/article-write/model/BottomCtaType";
import { saveWriteGeneratingPayload } from "@/features/article-write/lib/writeGeneratingSession";
import { getAllTemplates } from "@/entities/template/api/getTemplate";
import {
  MAX_STORED_POSTS,
  isAtStoredPostLimit,
} from "@/entities/template/model/postLimit";

export default function BottomCta({
  selectedTemplate,
  blogTitleValue,
  blogDescriptionValue,
  keywords,
}: BottomCtaProps) {
  const router = useRouter();

  const handleGenerateArticle = async () => {
    if (blogTitleValue.trim() === "" || blogDescriptionValue.trim() === "") {
      toast.warning("블로그 제목 아이디어, 상세 설명을 입력해 주세요.");
      return;
    }

    try {
      const templates = await getAllTemplates();
      if (isAtStoredPostLimit(templates?.length ?? 0)) {
        toast.error(
          `최대 ${MAX_STORED_POSTS}개의 포스트만 저장할 수 있습니다. 기존 글을 정리한 뒤 다시 시도해 주세요.`
        );
        return;
      }
    } catch {
      toast.error("저장 가능한 포스트 개수를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    saveWriteGeneratingPayload({
      selectedTemplate,
      blogTitleValue,
      blogDescriptionValue,
      keywords,
    });
    router.push("/write/generating");
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-xl border border-amber-500/30 bg-amber-500/5">
        <div className="flex items-center gap-3">
          <Lightbulb className="size-8 text-amber-400" />
          <div>
            <p className="text-white font-bold leading-none">
              생성할 준비가 되셨나요?
            </p>
            <p className="text-slate-400 text-sm mt-1">
              저장 가능: 포스트 최대 {MAX_STORED_POSTS}개까지. 생성 화면에서
              초안이 실시간으로 작성됩니다.
            </p>
          </div>
        </div>
        <Button
          onClick={() => void handleGenerateArticle()}
          className="font-bold shadow-lg bg-amber-500 hover:bg-amber-600 transition-all text-white">
          AI 글 생성하기
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
