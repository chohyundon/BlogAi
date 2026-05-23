"use client";

import type { LucideIcon } from "lucide-react";
import { AlertCircle, CheckCircle2, Radio, Sparkles, Wifi } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SyntaxHighlighter from "react-syntax-highlighter";
import { lucario } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { ArticleGenerationStatus } from "@/features/article-write/model/useArticleGenerationStream";
import "@/features/post-view/ui/markDown.css";

type GenerationProps = {
  preview: string;
  error: string;
  status: ArticleGenerationStatus;
};

function statusVisual(status: ArticleGenerationStatus): {
  badge: string;
  dot: string;
  Icon: LucideIcon;
} {
  switch (status) {
    case "연결 시도 중...":
      return {
        badge:
          "border-slate-500/35 bg-slate-800/80 text-slate-300 ring-1 ring-slate-600/30",
        dot: "bg-slate-400",
        Icon: Radio,
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

export default function Generation({
  preview,
  error,
  status,
}: GenerationProps) {
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
                생성과 동시에 본문이 스트리밍됩니다
              </p>
            </div>
          </div>
          <span
            className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${vs.badge}`}>
            <span className={`h-2 w-2 rounded-full ${vs.dot}`} />
            <StatusIcon className="h-3.5 w-3.5" aria-hidden />
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
          className={`relative min-h-[min(12rem,40vh)] max-h-[min(28rem,65vh)] overflow-y-auto rounded-xl border bg-navy-950/70 px-4 py-4 ${
            isStreaming && !error
              ? "border-emerald-500/25 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.08)]"
              : "border-navy-600/90"
          }`}>
          {preview ? (
            <div className="markdown">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
                      <SyntaxHighlighter
                        style={lucario}
                        language={match[1]}
                        PreTag="div">
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className}>{children}</code>
                    );
                  },
                }}>
                {preview}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              수신된 텍스트가 여기에 표시됩니다.
            </p>
          )}
        </div>

        {preview.length > 0 ? (
          <div className="flex items-center justify-between border-t border-navy-700/60 pt-3 text-xs text-slate-500">
            <span>수신 글자 수</span>
            <span className="font-medium tabular-nums text-slate-400">
              {preview.length.toLocaleString()}자
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
