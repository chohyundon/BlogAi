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
import { postTemplate } from "@/entities/template/api/postTemplate";
import { ensureUnderStoredPostLimit } from "@/entities/template/api/getTemplate";
import {
  MAX_STORED_POSTS,
  StoredPostLimitError,
} from "@/entities/template/model/postLimit";
import Button from "@/shared/ui/Button";
import LoadingComponent from "@/shared/ui/Loading";
import "@/features/post-view/ui/markDown.css";
import Generation from "@/features/article-write/ui/sse/Generation";
import { getSseTopicFromSession } from "@/features/article-write/lib/buildSseTopicFromSession";

const { sectionCard } = dashboardWriteStyles;

export default function GeneratingDraft() {
  const router = useRouter();
  const [phase, setPhase] = useState<"loading" | "done" | "saving" | "error">(
    "loading"
  );
  const [generatedArticle, setGeneratedArticle] =
    useState<GeneratedArticle | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const payload = peekWriteGeneratingPayload();
    if (!payload) {
      toast.warning("작성 정보가 없습니다. 다시 입력해 주세요.");
      router.replace("/write");
      return;
    }

    const generateArticle = async () => {
      try {
        setPhase("loading");

        // 단순한 동기 API 호출
        const result = await postArticle(payload);

        setGeneratedArticle(result);
        setPhase("saving");

        await ensureUnderStoredPostLimit();
        const saveResult = await postTemplate({
          title: result.title,
          content: result.content,
          keywords: result.keywords,
          template_type: payload.selectedTemplate,
        });

        clearWriteGeneratingPayload();
        toast.success("글이 성공적으로 저장되었습니다!");

        // 저장 완료 즉시 생성된 글 페이지로 이동
        if (saveResult && Array.isArray(saveResult) && saveResult.length > 0) {
          const postId = saveResult[0].id;
          router.push(`/post/${postId}`);
        } else {
          router.push("/mypage");
        }
      } catch (error) {
        setPhase("error");

        if (error instanceof StoredPostLimitError) {
          setErrorMessage(
            `저장된 포스트가 ${MAX_STORED_POSTS}개 한도에 도달했습니다. 기존 포스트를 삭제한 후 다시 시도해주세요.`
          );
        } else {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "글 생성 또는 저장에 실패했습니다."
          );
        }
      }
    };

    generateArticle();
  }, [router]);

  const handleSave = async () => {
    if (!generatedArticle) return;

    const payload = peekWriteGeneratingPayload();
    if (!payload) return;

    try {
      setPhase("saving");

      await ensureUnderStoredPostLimit();
      const result = await postTemplate({
        title: generatedArticle.title,
        content: generatedArticle.content,
        keywords: generatedArticle.keywords,
        template_type: payload.selectedTemplate,
      });

      clearWriteGeneratingPayload();
      toast.success("글이 성공적으로 저장되었습니다!");

      // 저장 완료 즉시 생성된 글 페이지로 이동
      if (result && Array.isArray(result) && result.length > 0) {
        const postId = result[0].id;
        router.push(`/post/${postId}`);
      } else {
        // 만약 ID를 가져올 수 없다면 마이페이지로 대체
        router.push("/mypage");
      }
    } catch (error) {
      setPhase("done");

      if (error instanceof StoredPostLimitError) {
        toast.error(
          `저장된 포스트가 ${MAX_STORED_POSTS}개 한도에 도달했습니다. 기존 포스트를 삭제한 후 다시 시도해주세요.`
        );
      } else {
        const errorMsg =
          error instanceof Error ? error.message : "저장에 실패했습니다.";
        toast.error(`저장 실패: ${errorMsg}`);
      }
    }
  };

  const handleRegenerate = () => {
    router.push("/write");
  };

  const sseTopic = getSseTopicFromSession();

  const renderContent = () => {
    switch (phase) {
      case "loading":
        return (
          <div className="h-full min-h-0 overflow-y-auto p-6 md:p-8">
            <div className="mx-auto w-full max-w-4xl pb-6">
              {sseTopic ? (
                <Generation topic={sseTopic} />
              ) : (
                <p className="text-center text-sm text-slate-400">
                  주제 정보를 불러올 수 없습니다.
                </p>
              )}
            </div>
          </div>
        );

      case "saving":
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <LoadingComponent />
              <p className="text-white text-lg mt-4">
                글을 저장하고 있습니다...
              </p>
              <p className="text-slate-400 text-sm mt-2">
                완료 후 자동으로 글 페이지로 이동합니다.
              </p>
            </div>
          </div>
        );

      case "error":
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="text-red-400 text-lg mb-4">생성/저장 실패</div>
              <p className="text-slate-300 mb-6">{errorMessage}</p>
              <Button
                onClick={handleRegenerate}
                className="bg-emerald-600 hover:bg-emerald-700">
                다시 시도
              </Button>
            </div>
          </div>
        );

      case "done":
        if (!generatedArticle) return null;

        return (
          <div className="h-full flex">
            {/* 메인 콘텐츠 영역 */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <div className="min-h-full">
                <div className="max-w-4xl mx-auto p-8">
                  <div className={`${sectionCard} bg-navy-800 border-navy-700`}>
                    <header className="mb-6">
                      <h1 className="text-3xl font-bold text-white mb-2">
                        {generatedArticle.title}
                      </h1>

                      <div className="flex flex-wrap gap-2">
                        {generatedArticle.keywords.map((keyword, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm">
                            #{keyword}
                          </span>
                        ))}
                      </div>
                    </header>

                    <div className="prose prose-invert max-w-none">
                      <div className="markdown">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({ className, children }) {
                              const match = /language-(\w+)/.exec(
                                className || ""
                              );
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
                          {generatedArticle.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                  <div className="h-8"></div>
                </div>
              </div>
            </div>

            {/* 사이드바 */}
            <div className="w-80 border-l border-navy-700 bg-navy-900 flex-shrink-0">
              <div className="h-full overflow-y-auto">
                <div className="p-6 flex flex-col min-h-full">
                  {/* 디버그 정보 패널 (개발환경에서만) */}
                  {process.env.NODE_ENV === "development" && (
                    <div className="mb-6 p-4 bg-navy-800 border border-navy-600 rounded-lg">
                      <h3 className="text-sm font-semibold text-yellow-400 mb-2">
                        🔍 Debug Info
                      </h3>
                      <div className="text-xs text-slate-300 space-y-1">
                        <div>
                          Phase: <span className="text-blue-400">{phase}</span>
                        </div>
                        <div>
                          Has Article:{" "}
                          <span className="text-green-400">
                            {generatedArticle ? "Yes" : "No"}
                          </span>
                        </div>
                        {generatedArticle && (
                          <>
                            <div>
                              Title:{" "}
                              <span className="text-white truncate block">
                                {generatedArticle.title}
                              </span>
                            </div>
                            <div>
                              Content Length:{" "}
                              <span className="text-orange-400">
                                {generatedArticle.content?.length || 0}
                              </span>
                            </div>
                            <div>
                              Keywords:{" "}
                              <span className="text-purple-400">
                                {generatedArticle.keywords?.length || 0}
                              </span>
                            </div>
                            <div>
                              Template:{" "}
                              <span className="text-pink-400">
                                {generatedArticle.template}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex-shrink-0">
                    <h2 className="text-lg font-semibold text-white mb-6">
                      작업
                    </h2>

                    <div className="space-y-4">
                      <Button
                        onClick={handleSave}
                        className="w-full bg-emerald-600 hover:bg-emerald-700">
                        저장하기
                      </Button>

                      <Button
                        onClick={handleRegenerate}
                        className="w-full bg-slate-600 hover:bg-slate-700">
                        다시 생성
                      </Button>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-navy-600 flex-shrink-0">
                    <h3 className="text-sm font-medium text-slate-300 mb-3">
                      생성 정보
                    </h3>
                    <div className="space-y-2 text-sm text-slate-400">
                      <div>제목: {generatedArticle.title}</div>
                      <div>키워드: {generatedArticle.keywords.length}개</div>
                      <div>글자 수: 약 {generatedArticle.content.length}자</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`${dashboardWriteStyles} ${NAVY} h-screen flex flex-col`}>
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

      {/* 헤더 */}
      <header className="px-8 py-6 border-b border-navy-700 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/write"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <span>뒤로 가기</span>
          </Link>
          <div className="h-6 w-px bg-slate-600"></div>
          <h1 className="text-xl font-semibold text-white">AI 블로그 생성</h1>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-hidden">{renderContent()}</main>
    </div>
  );
}
