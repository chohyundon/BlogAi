import LoadingComponent from "@/shared/ui/Loading";

export default function GeneratingDraftSavingPhase() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <LoadingComponent label="글 저장 중" />
        <div>
          <p className="text-white text-lg font-semibold">
            글을 저장하고 있습니다...
          </p>
          <p className="text-slate-300 text-sm mt-2">
            완료 후 자동으로 글 페이지로 이동합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
