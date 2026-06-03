"use client";

import { Lightbulb } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Button from "@/shared/ui/Button";
import { BottomCtaProps } from "@/features/article-write/model/BottomCtaType";
import { saveWriteGeneratingPayload } from "@/features/article-write/lib/writeGeneratingSession";
import { useStoredPostLimitCheck } from "@/entities/template/api/queryEnsure";
import { MAX_STORED_POSTS } from "@/entities/template/model/postLimit";
import { useAuthStore } from "@/features/auth/model/AuthStore";

export default function BottomCta({
  selectedTemplate,
  blogTitleValue,
  blogDescriptionValue,
  keywords,
}: BottomCtaProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { isChecking, isAtLimit, limitMessage, canSave } =
    useStoredPostLimitCheck(user?.id);

  const handleGenerateArticle = () => {
    if (blogTitleValue.trim() === "" || blogDescriptionValue.trim() === "") {
      toast.warning("블로그 제목 아이디어, 상세 설명을 입력해 주세요.");
      return;
    }

    if (!user) {
      toast.warning("글을 생성하려면 로그인이 필요합니다.");
      return;
    }

    if (isChecking) {
      toast.info("저장 가능 개수를 확인하는 중입니다.");
      return;
    }

    if (isAtLimit || !canSave) {
      toast.error(limitMessage);
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
              저장 가능: 포스트 최대 {MAX_STORED_POSTS}개까지. 생성 후 자동으로
              저장됩니다.
            </p>
          </div>
        </div>
        <Button
          onClick={handleGenerateArticle}
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
