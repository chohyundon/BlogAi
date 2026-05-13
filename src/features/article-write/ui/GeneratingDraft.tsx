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
import { postArticleStream, type StreamEvent } from "@/entities/article/api/postArticle";
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
import { ensureUnderStoredPostLimit } from "@/entities/template/api/getTemplate";
import {
  MAX_STORED_POSTS,
  StoredPostLimitError,
} from "@/entities/template/model/postLimit";
import Button from "@/shared/ui/Button";
import LoadingComponent from "@/shared/ui/Loading";
import { extractPartialContent } from "@/shared/lib/extractPartialJsonStringValue";
import { stabilizeMarkdownForPreview, extractStableTitle } from "@/shared/lib/stabilizeMarkdownForPreview";
import "@/features/post-view/ui/markDown.css";

const { sectionCard } = dashboardWriteStyles;

export default function GeneratingDraft() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [phase, setPhase] = useState<"loading" | "streaming" | "done" | "saving" | "error">(
    "loading"
  );
  const [generatedArticle, setGeneratedArticle] =
    useState<GeneratedArticle | null>(null);
  const [streamingContent, setStreamingContent] = useState<string>("");
  const [streamingTitle, setStreamingTitle] = useState<string>("");
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
        setStreamingContent("");
        setStreamingTitle("");
        
        await postArticleStream(payload, (event: StreamEvent) => {
          switch (event.type) {
            case "delta":
              setPhase("streaming");
              const { content, fullContent } = event.data;
              setStreamingContent(prev => {
                const newContent = prev + content;
                
                // 제목 추출 시도
                const title = extractStableTitle(fullContent || newContent);
                if (title) {
                  setStreamingTitle(title);
                }
                
                return newContent;
              });
              break;
              
            case "complete":
              setPhase("saving");
              setGeneratedArticle(event.data);
              
              // 자동으로 저장 시작
              setTimeout(async () => {
                try {
                  console.log("자동 저장 시작:", {
                    title: event.data.title,
                    content: event.data.content?.length + "글자",
                    keywords: event.data.keywords,
                    template_type: payload.selectedTemplate,
                  });
                  
                  await ensureUnderStoredPostLimit();
                  const result = await postTemplate({
                    title: event.data.title,
                    content: event.data.content,
                    keywords: event.data.keywords,
                    template_type: payload.selectedTemplate,
                  });
                  
                  console.log("저장 성공:", result);
                  clearWriteGeneratingPayload();
                  toast.success("글이 성공적으로 저장되었습니다!");
                  
                  // 2초 후 생성된 글 페이지로 이동
                  setTimeout(() => {
                    if (result && Array.isArray(result) && result.length > 0) {
                      const postId = result[0].id;
                      router.push(`/post/${postId}`);
                    } else {
                      // 만약 ID를 가져올 수 없다면 마이페이지로 대체
                      router.push("/mypage");
                    }
                  }, 2000);
                  
                } catch (error) {
                  console.error("Auto-save error details:", {
                    error,
                    message: error instanceof Error ? error.message : String(error),
                    stack: error instanceof Error ? error.stack : undefined,
                  });
                  setPhase("done"); // 자동 저장 실패 시 수동 저장 가능하도록
                  
                  if (error instanceof StoredPostLimitError) {
                    toast.error(
                      `저장된 포스트가 ${MAX_STORED_POSTS}개 한도에 도달했습니다. 기존 포스트를 삭제한 후 다시 시도해주세요.`
                    );
                  } else {
                    const errorMsg = error instanceof Error ? error.message : "자동 저장에 실패했습니다.";
                    toast.error(`저장 실패: ${errorMsg}`);
                  }
                }
              }, 1000); // 1초 후에 자동 저장 시작
              break;
              
            case "error":
              setPhase("error");
              setErrorMessage(event.data.error || "글 생성에 실패했습니다.");
              break;
          }
        });
      } catch (error) {
        console.error("Generation error:", error);
        setPhase("error");
        if (error instanceof StoredPostLimitError) {
          setErrorMessage(
            `저장된 포스트가 ${MAX_STORED_POSTS}개 한도에 도달했습니다. 기존 포스트를 삭제한 후 다시 시도해주세요.`
          );
        } else {
          setErrorMessage(
            error instanceof Error ? error.message : "글 생성에 실패했습니다."
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
      
      console.log("수동 저장 시작:", {
        title: generatedArticle.title,
        content: generatedArticle.content?.length + "글자",
        keywords: generatedArticle.keywords,
        template_type: payload.selectedTemplate,
      });
      
      await ensureUnderStoredPostLimit();
      const result = await postTemplate({
        title: generatedArticle.title,
        content: generatedArticle.content,
        keywords: generatedArticle.keywords,
        template_type: payload.selectedTemplate,
      });
      
      console.log("수동 저장 성공:", result);
      clearWriteGeneratingPayload();
      toast.success("글이 성공적으로 저장되었습니다!");
      
      setTimeout(() => {
        if (result && Array.isArray(result) && result.length > 0) {
          const postId = result[0].id;
          router.push(`/post/${postId}`);
        } else {
          // 만약 ID를 가져올 수 없다면 마이페이지로 대체
          router.push("/mypage");
        }
      }, 1000);
    } catch (error) {
      setPhase("done");
      console.error("Manual save error details:", {
        error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      if (error instanceof StoredPostLimitError) {
        toast.error(
          `저장된 포스트가 ${MAX_STORED_POSTS}개 한도에 도달했습니다. 기존 포스트를 삭제한 후 다시 시도해주세요.`
        );
      } else {
        const errorMsg = error instanceof Error ? error.message : "저장에 실패했습니다.";
        toast.error(`저장 실패: ${errorMsg}`);
      }
    }
  };

  const handleRegenerate = () => {
    router.push("/write");
  };

  const renderContent = () => {
    switch (phase) {
      case "loading":
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <LoadingComponent />
              <p className="text-white text-lg mt-4">
                AI가 블로그 글을 생성하고 있습니다...
              </p>
              <p className="text-slate-400 text-sm mt-2">
                잠시만 기다려주세요.
              </p>
            </div>
          </div>
        );

      case "streaming":
        return (
          <div className="h-full flex">
            {/* 메인 콘텐츠 영역 - 실시간 스트리밍 */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <div className="min-h-full">
                <div className="max-w-4xl mx-auto p-8">
                  <div className={`${sectionCard} bg-navy-800 border-navy-700`}>
                    <header className="mb-6">
                      <h1 className="text-3xl font-bold text-white mb-2">
                        {streamingTitle || "글을 생성하고 있습니다..."}
                      </h1>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                        <span className="text-slate-400 text-sm">실시간 생성 중...</span>
                      </div>
                    </header>
                    
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
                          {stabilizeMarkdownForPreview(streamingContent)}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                  <div className="h-8"></div>
                </div>
              </div>
            </div>

            {/* 사이드바 - 스트리밍 중 */}
            <div className="w-80 border-l border-navy-700 bg-navy-900 flex-shrink-0">
              <div className="h-full overflow-y-auto">
                <div className="p-6 flex flex-col min-h-full">
                  <div className="flex-shrink-0">
                    <h2 className="text-lg font-semibold text-white mb-6">생성 중...</h2>
                    
                    <div className="space-y-4">
                      <Button
                        isDisabled={true}
                        className="w-full bg-slate-600 opacity-50 cursor-not-allowed"
                      >
                        생성 완료까지 기다려주세요
                      </Button>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-navy-600 flex-shrink-0">
                    <h3 className="text-sm font-medium text-slate-300 mb-3">진행 상황</h3>
                    <div className="space-y-2 text-sm text-slate-400">
                      <div>생성된 글자 수: 약 {streamingContent.length}자</div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                        <span>AI가 글을 작성하고 있습니다...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "error":
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="text-red-400 text-lg mb-4">생성 실패</div>
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
      case "saving":
        if (!generatedArticle) return null;

        return (
          <div className="h-full flex">
            {/* 메인 콘텐츠 영역 - 스크롤 가능 */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <div className="min-h-full">
                <div className="max-w-4xl mx-auto p-8">
                  <div className={`${sectionCard} bg-navy-800 border-navy-700`}>
                    <header className="mb-6">
                      <h1 className="text-3xl font-bold text-white mb-2">
                        {generatedArticle.title}
                      </h1>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex flex-wrap gap-2">
                          {generatedArticle.keywords.map((keyword, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm">
                              #{keyword}
                            </span>
                          ))}
                        </div>
                        {phase === "saving" && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                            <span className="text-blue-400 text-sm">자동 저장 중...</span>
                          </div>
                        )}
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
                                  style={lucario as any}
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
                  {/* 하단 여백 추가 */}
                  <div className="h-8"></div>
                </div>
              </div>
            </div>

            {/* 사이드바 - 고정 */}
            <div className="w-80 border-l border-navy-700 bg-navy-900 flex-shrink-0">
              <div className="h-full overflow-y-auto">
                <div className="p-6 flex flex-col min-h-full">
                  <div className="flex-shrink-0">
                    <h2 className="text-lg font-semibold text-white mb-6">
                      {phase === "saving" ? "저장 중..." : "작업"}
                    </h2>

                    {phase === "saving" ? (
                      <div className="space-y-4">
                        <div className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg text-center">
                          <div className="flex items-center justify-center gap-2">
                            <LoadingComponent />
                            <span>자동 저장 중...</span>
                          </div>
                        </div>
                        <p className="text-slate-400 text-sm text-center">
                          저장 완료 후 작성한 글 페이지로 이동합니다
                        </p>
                      </div>
                    ) : (
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
                    )}
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
