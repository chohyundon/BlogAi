import LoadingComponent from "@/shared/ui/Loading";
import GeneratingDraftPhaseShell from "@/features/article-write/ui/generating/GeneratingDraftPhaseShell";

export default function GeneratingDraftSavingPhase() {
  return (
    <GeneratingDraftPhaseShell>
      <div className="flex w-full flex-col items-center gap-6">
        <LoadingComponent label="글 저장 중" fullWidth />
        <div>
          <p className="text-white text-xl font-semibold">
            글을 저장하고 있습니다...
          </p>
          <p className="mt-2 text-sm text-slate-300">
            완료 후 자동으로 글 페이지로 이동합니다.
          </p>
        </div>
      </div>
    </GeneratingDraftPhaseShell>
  );
}
