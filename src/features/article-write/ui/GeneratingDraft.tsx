"use client";

import { NAVY } from "@/features/article-write/ui/dashboardWriteStyles";
import GeneratingDraftHeader from "@/features/article-write/ui/generating/GeneratingDraftHeader";
import GeneratingDraftPhaseContent from "@/features/article-write/ui/generating/GeneratingDraftPhaseContent";
import { useGeneratingDraft } from "@/features/article-write/model/useGeneratingDraft";

export default function GeneratingDraft() {
  const {
    payload,
    phase,
    generatedArticle,
    errorMessage,
    handleSave,
    handleRegenerate,
  } = useGeneratingDraft();

  if (!payload) {
    return null;
  }

  return (
    <div className={`${NAVY.bg} flex h-full min-h-0 w-full flex-col`}>

      <GeneratingDraftHeader />

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <GeneratingDraftPhaseContent
          payload={payload}
          phase={phase}
          generatedArticle={generatedArticle}
          errorMessage={errorMessage}
          onSave={() => void handleSave()}
          onRegenerate={handleRegenerate}
        />
      </main>
    </div>
  );
}
