import { FileDown, Sparkles } from "lucide-react";

export default function PostButton({
  handleDownload,
  handleEdit,
  isSaving = false,
}: {
  handleDownload: () => void;
  handleEdit: () => void;
  isSaving?: boolean;
}) {
  return (
    <div className="flex gap-2 ml-auto">
      <button
        type="button"
        onClick={handleDownload}
        disabled={isSaving}
        className="flex items-center justify-center rounded-lg h-9 px-4 bg-blue-500/15 text-blue-400 border border-blue-500/25 hover:opacity-50 cursor-pointer transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed">
        <FileDown className="size-4 mr-2" />
        <span>다운로드</span>
      </button>
      <button
        type="button"
        onClick={handleEdit}
        disabled={isSaving}
        className="flex items-center justify-center rounded-lg h-9 px-4 bg-amber-500/15 text-amber-400 border border-amber-500/25 hover:opacity-50 cursor-pointer transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed">
        <Sparkles className="size-4 mr-2" />
        <span>{isSaving ? "저장 중..." : "수정하기"}</span>
      </button>
    </div>
  );
}
