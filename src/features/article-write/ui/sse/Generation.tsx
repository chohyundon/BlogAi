"use client";

import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Radio,
  Sparkles,
  Wifi,
} from "lucide-react";
import {
  useGeminiSseStream,
  type GeminiSseStatus,
} from "@/features/article-write/model/useGeminiSseStream";

type GenerationProps = {
  topic: string;
};

function statusVisual(status: GeminiSseStatus): {
  badge: string;
  dot: string;
  Icon: typeof Loader2;
  spin?: boolean;
} {
  switch (status) {
    case "연결 시도 중...":
      return {
        badge:
          "border-amber-500/35 bg-amber-500/10 text-amber-200 ring-1 ring-amber-500/20",
        dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]",
        Icon: Loader2,
        spin: true,
      };
    case "연결됨":
      return {
        badge:
          "border-emerald-500/35 bg-emerald-500/10 text-emerald-200 ring-1 ring-emerald-500/20",
        dot: "animate-pulse bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.45)]",
        Icon: Wifi,
      };
    case "완료":
      return {
        badge:
          "border-emerald-600/40 bg-emerald-600/15 text-emerald-100 ring-1 ring-emerald-500/25",
        dot: "bg-emerald-500",
        Icon: CheckCircle2,
      };
    case "에러":
      return {
        badge:
          "border-red-500/35 bg-red-500/10 text-red-200 ring-1 ring-red-500/20",
        dot: "bg-red-500",
        Icon: AlertCircle,
      };
    default:
      return {
        badge: "border-navy-600 bg-navy-800 text-slate-300",
        dot: "bg-slate-500",
        Icon: Radio,
      };
  }
}

export default function Generation({ topic }: GenerationProps) {
  const { data, error, status } = useGeminiSseStream(topic);
  const vs = statusVisual(status);
  const StatusIcon = vs.Icon;
  const isStreaming = status === "연결됨" || status === "연결 시도 중...";

  return (
    <section
      className="overflow-hidden rounded-2xl border border-navy-600/80 bg-linear-to-b from-navy-900/95 to-navy-950/90 shadow-xl shadow-black/20 ring-1 ring-white/5"
      aria-label="실시간 생성 미리보기">
      <div className="border-b border-navy-700/80 bg-navy-900/60 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500/20 to-teal-600/10 ring-1 ring-emerald-500/25">
              <Sparkles className="h-5 w-5 text-emerald-400" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold tracking-tight text-white">
                실시간 미리보기
              </h2>
              <p className="truncate text-xs text-slate-500">
                Gemini SSE · 작성 주제와 동일한 프롬프트로 스트리밍됩니다
              </p>
            </div>
          </div>
          <span
            className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${vs.badge}`}>
            <span className={`h-2 w-2 rounded-full ${vs.dot}`} />
            <StatusIcon
              className={`h-3.5 w-3.5 ${vs.spin ? "animate-spin" : ""}`}
              aria-hidden
            />
            {status}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-5">
        {error ? (
          <div className="flex gap-3 rounded-xl border border-red-500/25 bg-red-950/40 px-4 py-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
            <p className="text-sm leading-relaxed text-red-100/90">{error}</p>
          </div>
        ) : null}

        <div
          className={`relative min-h-48 max-h-[min(22rem,50vh)] overflow-y-auto rounded-xl border bg-navy-950/70 px-4 py-4 ${
            isStreaming && !error
              ? "border-emerald-500/25 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.08)]"
              : "border-navy-600/90"
          }`}>
          {isStreaming && data.length === 0 && !error ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500/70" />
              <p className="text-sm text-slate-400">스트림을 기다리는 중…</p>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-200">
              {data || (
                <span className="text-slate-500">
                  여기에 생성 텍스트가 실시간으로 표시됩니다.
                </span>
              )}
            </pre>
          )}
        </div>

        {data.length > 0 ? (
          <div className="flex items-center justify-between border-t border-navy-700/60 pt-3 text-xs text-slate-500">
            <span>수신 글자 수</span>
            <span className="font-medium tabular-nums text-slate-400">
              {data.length.toLocaleString()}자
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
