import Button from "@/shared/ui/Button";
import GeneratingDraftPhaseShell from "@/features/article-write/ui/generating/GeneratingDraftPhaseShell";

type GeneratingDraftErrorPhaseProps = {
  errorMessage: string;
  onRetry: () => void;
};

export default function GeneratingDraftErrorPhase({
  errorMessage,
  onRetry,
}: GeneratingDraftErrorPhaseProps) {
  return (
    <GeneratingDraftPhaseShell>
      <div className="max-w-md">
        <div className="text-red-400 text-lg mb-4">생성/저장 실패</div>
        <p className="text-slate-300 mb-6">{errorMessage}</p>
        <Button
          onClick={onRetry}
          className="bg-emerald-600 hover:bg-emerald-700">
          다시 시도
        </Button>
      </div>
    </GeneratingDraftPhaseShell>
  );
}
