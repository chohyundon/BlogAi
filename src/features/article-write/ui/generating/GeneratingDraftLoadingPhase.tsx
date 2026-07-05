import LoadingComponent from "@/shared/ui/Loading";
import GeneratingDraftPhaseShell from "@/features/article-write/ui/generating/GeneratingDraftPhaseShell";

type GeneratingDraftLoadingPhaseProps = {
  hasPayload: boolean;
};

export default function GeneratingDraftLoadingPhase({
  hasPayload,
}: GeneratingDraftLoadingPhaseProps) {
  return (
    <GeneratingDraftPhaseShell>
      {hasPayload ? (
        <div className="flex w-full flex-col items-center gap-6">
          <LoadingComponent label="AI 글 생성 중" fullWidth />
          <div>
            <p className="text-white text-xl font-semibold">
              AI가 글을 작성하고 있습니다...
            </p>
            <p className="mt-2 text-sm text-slate-300">
              완료되면 자동으로 저장됩니다.
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-400">
          작성 정보를 불러올 수 없습니다.
        </p>
      )}
    </GeneratingDraftPhaseShell>
  );
}
