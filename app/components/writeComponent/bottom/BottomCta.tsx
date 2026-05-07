import { Lightbulb } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import Button from "../../button/Button";
import { postArticle } from "@/app/services/postArticle";
import { BottomCtaProps } from "@/app/types/BottomCtaType";

export default function BottomCta({
  selectedTemplate,
  blogTitleValue,
  blogDescriptionValue,
  keywords,
  setIsLoading,
  setGeneratedArticle,
}: BottomCtaProps) {
  const handleGenerateArticle = async () => {
    if (blogTitleValue.trim() === "" || blogDescriptionValue.trim() === "") {
      toast.warning("블로그 제목 아이디어, 상세 설명을 입력해 주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await postArticle({
        selectedTemplate,
        blogTitleValue,
        blogDescriptionValue,
        keywords,
      });
      const keywordsArray =
        typeof response.keywords === "string"
          ? response.keywords
              .split(",")
              .map((k: string) => k.trim())
              .filter(Boolean)
          : Array.isArray(response.keywords)
          ? response.keywords
          : [];
      setGeneratedArticle({
        title: response.title ?? "",
        content: response.content ?? "",
        keywords: keywordsArray,
        template: selectedTemplate,
      });
    } catch (e) {
      toast.error("AI 글 생성 중 오류가 발생했습니다. 다시 시도해 주세요.");
      setIsLoading(false);
    }
    // 생성 성공 시에는 로딩을 유지한다. 부모가 저장 후 router.push 하거나 실패 시 끈다.
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
              AI가 몇 초 안에 초안을 작성해 드립니다.
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
