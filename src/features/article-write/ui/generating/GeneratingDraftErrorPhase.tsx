import { AlertCircle, RefreshCw } from "lucide-react";
import { dashboardWriteStyles } from "@/features/article-write/ui/dashboardWriteStyles";
import Button from "@/shared/ui/Button";

type GeneratingDraftErrorPhaseProps = {
  errorMessage: string;
  onRetry: () => void;
};

export default function GeneratingDraftErrorPhase({
  errorMessage,
  onRetry,
}: GeneratingDraftErrorPhaseProps) {
  const { sectionCard } = dashboardWriteStyles;
  return (
    <div className="flex h-full items-center justify-center p-6 md:p-8">
      <div
        className={`${sectionCard} w-full max-w-md border-red-500/20 text-center shadow-red-500/5`}>
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl border border-red-500/25 bg-red-500/10">
          <AlertCircle className="size-8 text-red-400" aria-hidden />
        </div>

        <h2 className="mb-2 text-xl font-bold text-white">생성/저장 실패</h2>
        <p className="mb-6 text-sm leading-relaxed text-slate-400">
          AI 글 생성 또는 저장 중 문제가 발생했습니다.
          <br />
          잠시 후 다시 시도해 주세요.
        </p>

        <div className="mb-8 rounded-lg border border-navy-600 bg-navy-800/70 px-4 py-3 text-left">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            오류 내용
          </p>
          <p className="mt-1.5 text-sm leading-relaxed wrap-break-word text-slate-300">
            {errorMessage}
          </p>
        </div>

        <Button
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-white shadow-lg shadow-amber-500/20 hover:bg-amber-400">
          <RefreshCw className="size-4" />
          다시 시도
        </Button>
      </div>
    </div>
  );
}
