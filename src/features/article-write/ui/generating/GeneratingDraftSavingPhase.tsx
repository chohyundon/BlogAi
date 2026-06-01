import LoadingComponent from "@/shared/ui/Loading";

export default function GeneratingDraftSavingPhase() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <LoadingComponent />
        <p className="text-white text-lg mt-4">글을 저장하고 있습니다...</p>
        <p className="text-slate-400 text-sm mt-2">
          완료 후 자동으로 글 페이지로 이동합니다.
        </p>
      </div>
    </div>
  );
}
