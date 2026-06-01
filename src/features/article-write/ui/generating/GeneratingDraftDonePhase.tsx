import type { GeneratedArticle } from "@/entities/article/model/generatedArticle";
import type { GeneratingDraftPhase } from "@/features/article-write/model/generatingDraftPhase";
import { dashboardWriteStyles } from "@/features/article-write/ui/dashboardWriteStyles";
import ArticleMarkdownView from "@/features/article-write/ui/generating/ArticleMarkdownView";
import GeneratingDraftSidebar from "@/features/article-write/ui/generating/GeneratingDraftSidebar";

const { sectionCard } = dashboardWriteStyles;

type GeneratingDraftDonePhaseProps = {
  phase: GeneratingDraftPhase;
  generatedArticle: GeneratedArticle;
  onSave: () => void;
  onRegenerate: () => void;
};

export default function GeneratingDraftDonePhase({
  phase,
  generatedArticle,
  onSave,
  onRegenerate,
}: GeneratingDraftDonePhaseProps) {
  return (
    <div className="h-full flex">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="min-h-full">
          <div className="max-w-4xl mx-auto p-8">
            <div className={`${sectionCard} bg-navy-800 border-navy-700`}>
              <header className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {generatedArticle.title}
                </h1>

                <div className="flex flex-wrap gap-2">
                  {generatedArticle.keywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm">
                      #{keyword}
                    </span>
                  ))}
                </div>
              </header>

              <ArticleMarkdownView content={generatedArticle.content} />
            </div>
            <div className="h-8" />
          </div>
        </div>
      </div>

      <GeneratingDraftSidebar
        phase={phase}
        generatedArticle={generatedArticle}
        onSave={onSave}
        onRegenerate={onRegenerate}
      />
    </div>
  );
}
