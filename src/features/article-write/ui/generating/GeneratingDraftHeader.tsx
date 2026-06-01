import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function GeneratingDraftHeader() {
  return (
    <header className="px-8 py-6 border-b border-navy-700 shrink-0">
      <div className="flex items-center gap-4">
        <Link
          href="/write"
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
          <span>뒤로 가기</span>
        </Link>
        <div className="h-6 w-px bg-slate-600" />
        <h1 className="text-xl font-semibold text-white">AI 블로그 생성</h1>
      </div>
    </header>
  );
}
