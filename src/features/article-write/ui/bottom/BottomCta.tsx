import { Lightbulb } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import Button from "@/shared/ui/Button";
import { postArticleStream } from "@/entities/article/api/postArticleStream";
import { BottomCtaProps } from "@/features/article-write/model/BottomCtaType";

export default function BottomCta({
  selectedTemplate,
  blogTitleValue,
  blogDescriptionValue,
  keywords,
  setIsLoading,
  setGeneratedArticle,
  onStreamDelta,
  onStreamBegin,
  onStreamComplete,
}: BottomCtaProps) {
  const handleGenerateArticle = async () => {
    if (blogTitleValue.trim() === "" || blogDescriptionValue.trim() === "") {
      toast.warning("블로그 제목 아이디어, 상세 설명을 입력해 주세요.");
      return;
    }

    setIsLoading(true);
    onStreamBegin?.();

    try {
      const response = await postArticleStream(
        {
          selectedTemplate,
          blogTitleValue,
          blogDescriptionValue,
          keywords,
        },
        {
          onDelta: (preview) => {
            onStreamDelta?.(preview);
          },
        }
      );
      onStreamComplete?.();
      setGeneratedArticle(response);
    } catch (e) {
      onStreamComplete?.();
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
              AI가 초안을 실시간으로 작성합니다. 잠시만 기다려 주세요.
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
