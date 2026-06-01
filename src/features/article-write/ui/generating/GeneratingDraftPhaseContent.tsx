import type { GeneratedArticle } from "@/entities/article/model/generatedArticle";
import type { GeneratingDraftPhase } from "@/features/article-write/model/generatingDraftPhase";
import type { WriteGeneratingPayload } from "@/features/article-write/lib/writeGeneratingSession";
import GeneratingDraftDonePhase from "@/features/article-write/ui/generating/GeneratingDraftDonePhase";
import GeneratingDraftErrorPhase from "@/features/article-write/ui/generating/GeneratingDraftErrorPhase";
import GeneratingDraftLoadingPhase from "@/features/article-write/ui/generating/GeneratingDraftLoadingPhase";
import GeneratingDraftSavingPhase from "@/features/article-write/ui/generating/GeneratingDraftSavingPhase";

type GeneratingDraftPhaseContentProps = {
  payload: WriteGeneratingPayload | null;
  phase: GeneratingDraftPhase;
  generatedArticle: GeneratedArticle | null;
  errorMessage: string;
  onSave: () => void;
  onRegenerate: () => void;
};

export default function GeneratingDraftPhaseContent({
  payload,
  phase,
  generatedArticle,
  errorMessage,
  onSave,
  onRegenerate,
}: GeneratingDraftPhaseContentProps) {
  switch (phase) {
    case "loading":
      return <GeneratingDraftLoadingPhase hasPayload={Boolean(payload)} />;

    case "saving":
      return <GeneratingDraftSavingPhase />;

    case "error":
      return (
        <GeneratingDraftErrorPhase
          errorMessage={errorMessage}
          onRetry={onRegenerate}
        />
      );

    case "done":
      if (!generatedArticle) return null;

      return (
        <GeneratingDraftDonePhase
          phase={phase}
          generatedArticle={generatedArticle}
          onSave={onSave}
          onRegenerate={onRegenerate}
        />
      );

    default:
      return null;
  }
}
