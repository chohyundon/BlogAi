import type { GeneratedArticle } from "@/entities/article/model/generatedArticle";
import type { GeneratingDraftPhase } from "@/features/article-write/model/generatingDraftPhase";
import Button from "@/shared/ui/Button";

type GeneratingDraftSidebarProps = {
  phase: GeneratingDraftPhase;
  generatedArticle: GeneratedArticle;
  onSave: () => void;
  onRegenerate: () => void;
};

export default function GeneratingDraftSidebar({
  phase,
  generatedArticle,
  onSave,
  onRegenerate,
}: GeneratingDraftSidebarProps) {
  return (
    <div className="w-80 border-l border-navy-700 bg-navy-900 shrink-0">
      <div className="h-full overflow-y-auto">
        <div className="p-6 flex flex-col min-h-full">
          {process.env.NODE_ENV === "development" && (
            <div className="mb-6 p-4 bg-navy-800 border border-navy-600 rounded-lg">
              <h3 className="text-sm font-semibold text-yellow-400 mb-2">
                🔍 Debug Info
              </h3>
              <div className="text-xs text-slate-300 space-y-1">
                <div>
                  Phase: <span className="text-blue-400">{phase}</span>
                </div>
                <div>
                  Has Article:{" "}
                  <span className="text-green-400">
                    {generatedArticle ? "Yes" : "No"}
                  </span>
                </div>
                <div>
                  Title:{" "}
                  <span className="text-white truncate block">
                    {generatedArticle.title}
                  </span>
                </div>
                <div>
                  Content Length:{" "}
                  <span className="text-orange-400">
                    {generatedArticle.content?.length || 0}
                  </span>
                </div>
                <div>
                  Keywords:{" "}
                  <span className="text-purple-400">
                    {generatedArticle.keywords?.length || 0}
                  </span>
                </div>
                <div>
                  Template:{" "}
                  <span className="text-pink-400">{generatedArticle.template}</span>
                </div>
              </div>
            </div>
          )}

          <div className="shrink-0">
            <h2 className="text-lg font-semibold text-white mb-6">작업</h2>

            <div className="space-y-4">
              <Button
                onClick={onSave}
                className="w-full bg-emerald-600 hover:bg-emerald-700">
                저장하기
              </Button>

              <Button
                onClick={onRegenerate}
                className="w-full bg-slate-600 hover:bg-slate-700">
                다시 생성
              </Button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-navy-600 shrink-0">
            <h3 className="text-sm font-medium text-slate-300 mb-3">생성 정보</h3>
            <div className="space-y-2 text-sm text-slate-400">
              <div>제목: {generatedArticle.title}</div>
              <div>키워드: {generatedArticle.keywords.length}개</div>
              <div>글자 수: 약 {generatedArticle.content.length}자</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
