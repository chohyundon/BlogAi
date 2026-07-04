import LoadingComponent from "@/shared/ui/Loading";

type GeneratingDraftLoadingPhaseProps = {
  hasPayload: boolean;
};

export default function GeneratingDraftLoadingPhase({
  hasPayload,
}: GeneratingDraftLoadingPhaseProps) {
  return (
    <div className="h-full flex items-center justify-center p-6 md:p-8">
      <div className="text-center">
        {hasPayload ? (
          <div className="flex flex-col items-center gap-4">
            <LoadingComponent label="AI 글 생성 중" />
            <div>
              <p className="text-white text-lg font-semibold">
                AI가 글을 작성하고 있습니다...
              </p>
              <p className="text-slate-300 text-sm mt-2">
                완료되면 자동으로 저장됩니다.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-center text-sm text-slate-400">
            작성 정보를 불러올 수 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}
