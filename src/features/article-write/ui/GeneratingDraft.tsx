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
import { postArticle } from "@/entities/article/api/postArticle";
import type { GeneratedArticle } from "@/entities/article/model/generatedArticle";
import {
  peekWriteGeneratingPayload,
  clearWriteGeneratingPayload,
} from "@/features/article-write/lib/writeGeneratingSession";
import {
  NAVY,
  dashboardWriteStyles,
} from "@/features/article-write/ui/dashboardWriteStyles";
import { useAuthStore } from "@/features/auth/model/AuthStore";
import { postTemplate } from "@/entities/template/api/postTemplate";
import {
  ensureUnderStoredPostLimit,
} from "@/entities/template/api/getTemplate";
import {
  MAX_STORED_POSTS,
  StoredPostLimitError,
} from "@/entities/template/model/postLimit";
import "@/features/post-view/ui/markDown.css";

export default function GeneratingDraft() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GeneratedArticle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      router.push("/write");
      return;
    }

    const payload = peekWriteGeneratingPayload();
    if (!payload) {
      router.push("/write");
      return;
    }

    const generate = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const generated = await postArticle(payload);
        setResult(generated);
      } catch (err) {
        console.error("Generation error:", err);
        if (err instanceof StoredPostLimitError) {
          setError(
            `저장된 포스트가 ${MAX_STORED_POSTS}개 한도에 도달했습니다. 기존 포스트를 삭제한 후 다시 시도해주세요.`
          );
        } else {
          setError(
            err instanceof Error ? err.message : "글 생성에 실패했습니다."
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    generate();
  }, [user?.id, router]);

  const handleSave = async () => {
    if (!result) return;

    const payload = peekWriteGeneratingPayload();
    if (!payload) return;

    try {
      await ensureUnderStoredPostLimit();
      await postTemplate({
        title: result.title,
        content: result.content,
        keywords: result.keywords,
        template_type: payload.selectedTemplate,
      });
      clearWriteGeneratingPayload();
      toast.success("글이 성공적으로 저장되었습니다!");
      
      setTimeout(() => {
        router.push("/mypage");
      }, 1000);
    } catch (err) {
      console.error("Save error:", err);
      if (err instanceof StoredPostLimitError) {
        toast.error(
          `저장된 포스트가 ${MAX_STORED_POSTS}개 한도에 도달했습니다. 기존 포스트를 삭제한 후 다시 시도해주세요.`
        );
      } else {
        toast.error(
          err instanceof Error ? err.message : "저장에 실패했습니다."
        );
      }
    }
  };

  const handleRegenerate = () => {
    router.push("/write");
  };

  return (
    <div className={`${dashboardWriteStyles} ${NAVY}`}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="px-8 py-6 border-b border-navy-700 flex-shrink-0">
          <div className="flex items-center gap-4">
            <Link
              href="/write"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>뒤로 가기</span>
            </Link>
            <div className="h-6 w-px bg-slate-600"></div>
            <h1 className="text-xl font-semibold text-white">AI 블로그 생성</h1>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          {isLoading && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-4"></div>
                <p className="text-white text-lg">AI가 블로그 글을 생성하고 있습니다...</p>
                <p className="text-slate-400 text-sm mt-2">잠시만 기다려주세요.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="text-red-400 text-lg mb-4">생성 실패</div>
                <p className="text-slate-300 mb-6">{error}</p>
                <button
                  onClick={handleRegenerate}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  다시 시도
                </button>
              </div>
            </div>
          )}

          {result && (
            <div className="h-full flex">
              <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-navy-800 rounded-lg border border-navy-700 p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">
                      {result.title}
                    </h2>
                    <div className="prose prose-invert max-w-none">
                      <div className="markdown">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({ className, children }) {
                              const match = /language-(\w+)/.exec(className || "");
                              return match ? (
                                <SyntaxHighlighter
                                  style={lucario as any}
                                  language={match[1]}
                                  PreTag="div"
                                >
                                  {String(children).replace(/\n$/, "")}
                                </SyntaxHighlighter>
                              ) : (
                                <code className={className}>
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {result.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {result.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm"
                        >
                          #{keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-80 border-l border-navy-700 p-6 flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-4">작업</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleSave}
                    className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
                  >
                    저장하기
                  </button>
                  <button
                    onClick={handleRegenerate}
                    className="w-full px-4 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                  >
                    다시 생성
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}