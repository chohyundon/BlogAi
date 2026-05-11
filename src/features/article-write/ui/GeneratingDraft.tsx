"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SyntaxHighlighter from "react-syntax-highlighter";
import { lucario } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ArrowLeft } from "lucide-react";
import { postArticleStream } from "@/entities/article/api/postArticleStream";
import type { GeneratedArticle } from "@/entities/article/model/generatedArticle";
import {
  peekWriteGeneratingPayload,
  clearWriteGeneratingPayload,
} from "@/features/article-write/lib/writeGeneratingSession";
import {
  NAVY,
  dashboardWriteStyles,
} from "@/features/article-write/ui/dashboardWriteStyles";
import { stabilizeMarkdownForPreview } from "@/shared/lib/stabilizeMarkdownForPreview";
import { useAuthStore } from "@/features/auth/model/AuthStore";
import { postTemplate } from "@/entities/template/api/postTemplate";
import { getAllTemplates } from "@/entities/template/api/getTemplate";
import Button from "@/shared/ui/Button";
import LoadingComponent from "@/shared/ui/Loading";
import "@/features/post-view/ui/markDown.css";

const { sectionCard } = dashboardWriteStyles;

export default function GeneratingDraft() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [streamPreview, setStreamPreview] = useState({
    title: "",
    content: "",
  });
  const [phase, setPhase] = useState<"streaming" | "saving" | "error">(
    "streaming"
  );
  const [generatedArticle, setGeneratedArticle] =
    useState<GeneratedArticle | null>(null);

  useEffect(() => {
    const payload = peekWriteGeneratingPayload();
    if (!payload) {
      toast.warning("작성 정보가 없습니다. 다시 입력해 주세요.");
      router.replace("/write");
      return;
    }

    const ac = new AbortController();
    let cancelled = false;
    setPhase("streaming");

    (async () => {
      try {
        const article = await postArticleStream(
          {
            selectedTemplate: payload.selectedTemplate,
            blogTitleValue: payload.blogTitleValue,
            blogDescriptionValue: payload.blogDescriptionValue,
            keywords: payload.keywords,
          },
          {
            signal: ac.signal,
            onDelta: (preview) => {
              if (!cancelled) setStreamPreview(preview);
            },
          }
        );
        if (cancelled) return;
        clearWriteGeneratingPayload();
        setGeneratedArticle(article);
      } catch (e) {
        if (cancelled) return;
        if (e instanceof DOMException && e.name === "AbortError") return;
        clearWriteGeneratingPayload();
        toast.error("AI 글 생성 중 오류가 발생했습니다.");
        setPhase("error");
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [router]);

  useEffect(() => {
    if (!generatedArticle || !generatedArticle.content.trim()) return;
    if (!user) {
      toast.error("저장하려면 로그인이 필요합니다.");
      setPhase("error");
      return;
    }

    const saveAndGo = async () => {
      setPhase("saving");
      const templates = await getAllTemplates();
      if ((templates?.length ?? 0) >= 10) {
        toast.error("최대 10개의 포스트만 저장할 수 있습니다.");
        setPhase("error");
        return;
      }

      try {
        const data = await postTemplate({
          title: generatedArticle.title,
          content: generatedArticle.content,
          template_type: generatedArticle.template,
          keywords: generatedArticle.keywords,
        });
        const row = Array.isArray(data) ? data[0] : data;
        const id =
          row && typeof row === "object" && "id" in row ? row.id : undefined;
        if (id) {
          router.replace(`/post/${id}`);
          return;
        }
        toast.error("저장은 되었지만 글 페이지로 이동할 수 없습니다.");
        setPhase("error");
      } catch (err) {
        console.error(err);
        toast.error(
          err instanceof Error ? err.message : "저장에 실패했습니다."
        );
        setPhase("error");
      }
    };
    saveAndGo();
  }, [generatedArticle, user, router]);

  if (phase === "saving") {
    return <LoadingComponent />;
  }

  if (phase === "error") {
    return (
      <main
        className={`w-full min-h-full flex flex-col items-center justify-center px-6 py-16 ${NAVY.bg}`}>
        <div className="max-w-md text-center space-y-6">
          <p className="text-slate-300">
            생성 또는 저장 중 문제가 생겼습니다. 작성 화면에서 다시 시도해
            주세요.
          </p>
          <Button
            className="font-bold bg-amber-500 hover:bg-amber-600 text-white"
            onClick={() => router.push("/write")}>
            작성 화면으로
          </Button>
        </div>
        <ToastContainer
          position="top-right"
          autoClose={2500}
          hideProgressBar
          theme="dark"
        />
      </main>
    );
  }

  return (
    <main
      className={`w-full min-h-full flex flex-col overflow-y-auto ${NAVY.bg}`}>
      <div className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 pb-20">
        <div className="mb-8">
          <Link
            href="/write"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-400 text-sm font-medium transition-colors">
            <ArrowLeft className="size-4" />
            작성 설정으로 돌아가기
          </Link>
        </div>

        <h1 className="text-white text-3xl font-black tracking-tight mb-2">
          초안 생성 중
        </h1>
        <p className="text-slate-400 text-sm mb-8">
          AI가 글을 이 페이지에서 실시간으로 작성합니다. 완료되면 자동으로
          포스트 화면으로 이동합니다.
        </p>

        <section
          className={`${sectionCard} border-amber-500/30 ring-1 ring-amber-500/20`}>
          <div className="flex items-center gap-2 mb-4">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
            </span>
            <h2 className="text-white font-bold text-lg">스트리밍 미리보기</h2>
          </div>
          {streamPreview.title ? (
            <p className="text-amber-200/90 font-semibold text-base mb-3">
              {streamPreview.title}
            </p>
          ) : (
            <p className="text-slate-500 text-sm mb-3">
              제목과 본문이 순서대로 채워집니다.
            </p>
          )}
          <div className="markdown min-h-48 max-h-[min(40rem,60vh)] overflow-y-auto rounded-lg border border-slate-700/80 bg-slate-950/50 p-4 prose-invert max-w-none text-sm">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return match ? (
                    <SyntaxHighlighter
                      language={match[1]}
                      style={lucario}
                      customStyle={{
                        borderRadius: "0.5rem",
                        margin: "0.5rem 0",
                        padding: "0.75rem",
                        background: "#1e1e3f",
                        fontSize: "0.75rem",
                      }}
                      PreTag="div">
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code className="inline-code" {...props}>
                      {children}
                    </code>
                  );
                },
              }}>
              {stabilizeMarkdownForPreview(streamPreview.content)}
            </ReactMarkdown>
          </div>
        </section>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar
        theme="dark"
      />
    </main>
  );
}
