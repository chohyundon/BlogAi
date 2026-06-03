import { FileDown, Sparkles } from "lucide-react";

export default function PostButton({
  handleDownload,
  handleEdit,
}: {
  handleDownload: () => void;
  handleEdit: () => void;
}) {
  return (
    <div>
      <button
        onClick={handleDownload}
        className="flex ml-auto items-center justify-center rounded-lg h-9 px-4 bg-blue-500/15 text-blue-400 border border-blue-500/25 hover:opacity-50 cursor-pointer transition-all font-semibold text-sm">
        <FileDown className="size-4 mr-2" />
        <span>다운로드</span>
      </button>
      <button
        onClick={handleEdit}
        className="flex items-center justify-center rounded-lg h-9 px-4 bg-amber-500/15 text-amber-400 border border-amber-500/25 hover:opacity-50 cursor-pointer transition-all font-semibold text-sm">
        <Sparkles className="size-4 mr-2" />
        <span>수정하기</span>
      </button>
    </div>
  );
}
