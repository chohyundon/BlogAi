"use client";

import { ToastContainer } from "react-toastify";
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

  return (
    <div className={`${NAVY.bg} h-screen flex flex-col`}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      <GeneratingDraftHeader />

      <main className="flex-1 overflow-hidden">
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
