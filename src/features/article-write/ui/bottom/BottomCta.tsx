"use client";

import { Lightbulb } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Button from "@/shared/ui/Button";
import { BottomCtaProps } from "@/features/article-write/model/BottomCtaType";
import { saveWriteGeneratingPayload } from "@/features/article-write/lib/writeGeneratingSession";

export default function BottomCta({
  selectedTemplate,
  blogTitleValue,
  blogDescriptionValue,
  keywords,
}: BottomCtaProps) {
  const router = useRouter();

  const handleGenerateArticle = () => {
    if (blogTitleValue.trim() === "" || blogDescriptionValue.trim() === "") {
      toast.warning("블로그 제목 아이디어, 상세 설명을 입력해 주세요.");
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
              생성 화면으로 이동해 초안이 실시간으로 작성됩니다.
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
