"use client";

import { useGeminiSseStream } from "@/features/article-write/model/useGeminiSseStream";

type GenerationProps = {
  topic: string;
};

export default function Generation({ topic }: GenerationProps) {
  const { data, error, status } = useGeminiSseStream(topic);

  return (
    <div className="rounded-xl border border-navy-700 bg-navy-900 p-5 text-white shadow-lg">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-navy-700 pb-3">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          상태
        </span>
        <span className="rounded-full border border-navy-600 bg-navy-800 px-3 py-1 text-xs font-medium text-emerald-400">
          {status}
        </span>
      </div>
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          <span className="font-medium text-red-400">에러</span>
          <span className="mx-1.5 text-red-500/60">·</span>
          {error}
        </div>
      )}
      <div className="min-h-[10rem] max-h-72 overflow-y-auto rounded-lg border border-navy-600 bg-navy-950/50 p-4 text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
        {data || <span className="text-slate-500">데이터 대기 중...</span>}
      </div>
    </div>
  );
}
