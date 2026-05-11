"use client";

import { useEffect, useState } from "react";
import Button from "@/shared/ui/Button";
import { TEMPLATES } from "@/entities/template/config/Template";
import WriteSectionHeader from "./Header/WriteSectionHeader";
import WriteInfoToolTip from "./infoTooltip/WriteInfoToolTip";
import LoadingComponent from "@/shared/ui/Loading";
import { CheckCircle } from "lucide-react";
import { NAVY, dashboardWriteStyles } from "./dashboardWriteStyles";
import { useAuthStore } from "@/features/auth/model/AuthStore";
import { useRouter } from "next/navigation";
import { postTemplate } from "@/entities/template/api/postTemplate";
import WriteKeyWord from "./keyword/WriteKeyWord";
import BottomCta from "./bottom/BottomCta";
import type { GeneratedArticle } from "@/entities/article/model/generatedArticle";
import { getAllTemplates } from "@/entities/template/api/getTemplate";
import { toast } from "react-toastify";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SyntaxHighlighter from "react-syntax-highlighter";
import { lucario } from "react-syntax-highlighter/dist/esm/styles/prism";
import { stabilizeMarkdownForPreview } from "@/shared/lib/stabilizeMarkdownForPreview";
import "@/features/post-view/ui/markDown.css";
const { inputBase, sectionCard, templateCardBase } = dashboardWriteStyles;

export default function DashBoardWrite() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("TIL");
  const [blogTitleValue, setBlogTitleValue] = useState<string>("");
  const [blogDescriptionValue, setBlogDescriptionValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [keywords, setKeywords] = useState<string[]>([
    "React",
    "성능 최적화",
    "프론트엔드",
  ]);

  const [generatedArticle, setGeneratedArticle] =
    useState<GeneratedArticle | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamPreview, setStreamPreview] = useState<{
    title: string;
    content: string;
  }>({ title: "", content: "" });
  const user = useAuthStore((state) => state.user);

  // 생성 성공 후 Supabase에 저장하고, 저장된 id로 /post/[id] 이동
  useEffect(() => {
    if (!generatedArticle || !generatedArticle.content.trim() || !user) return;

    const saveAndGoToPost = async () => {
      const templates = await getAllTemplates();
      if ((templates?.length ?? 0) >= 10) {
        toast.error("최대 10개의 포스트만 저장할 수 있습니다.");
        setIsLoading(false);
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
          router.push(`/post/${id}`);
          return;
        }
        toast.error("저장은 되었지만 글 페이지로 이동할 수 없습니다.");
      } catch (err) {
        console.error(err);
        toast.error(
          err instanceof Error ? err.message : "저장에 실패했습니다."
        );
      }
      setIsLoading(false);
    };
    saveAndGoToPost();
  }, [generatedArticle, user, router]);

  const showFullPageLoader = isLoading && !isStreaming;

  if (showFullPageLoader) {
    return <LoadingComponent />;
  }

  const handleSampleView = () => {
    router.push("/post");
  };

  return (
    <main
      className={`w-full min-h-full flex flex-col overflow-y-auto ${NAVY.bg}`}>
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 pb-20">
        <section className="flex flex-wrap justify-between items-end gap-4 mb-10">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">
              블로그 콘텐츠 설정
            </h1>
            <p className="text-slate-400 text-base mt-0.5">
              아래 세부 정보를 입력하면 AI가 기술 문서를 대신 작성해 드립니다.
            </p>
          </div>

          <Button
            onClick={handleSampleView}
            className="font-bold shadow-lg bg-amber-500 hover:bg-amber-600 transition-all text-white">
            샘플 보기
          </Button>
        </section>

        <section className="space-y-8">
          {/* 1. 템플릿 선택 */}
          <section className={sectionCard}>
            <WriteSectionHeader step={1} title="템플릿 선택" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplate === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={`${templateCardBase} ${
                      isSelected ? "relative " : ""
                    } ${
                      isSelected
                        ? "border-amber-500/60 bg-amber-500/10"
                        : `border-slate-600/50 ${NAVY.card} hover:border-slate-500`
                    } text-left`}>
                    {isSelected && (
                      <div className="absolute top-3 right-3 text-amber-400">
                        <CheckCircle className="size-5" />
                      </div>
                    )}
                    <span
                      className={`text-3xl mb-2 block ${
                        isSelected ? "text-amber-400" : "text-slate-500"
                      }`}>
                      <tpl.icon className="size-8 text-amber-300" />
                    </span>
                    <h3 className="text-white font-bold text-lg mb-1">
                      {tpl.name}
                    </h3>
                    <p className="text-slate-400 text-sm">{tpl.description}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2. 주제 입력 */}
          <section className={sectionCard}>
            <WriteSectionHeader
              step={2}
              title="주제 입력"
              tooltip="최대한 구체적으로 작성하세요. 사용하는 기술 스택과 핵심 문제 또는 개념을 포함하면 더 좋은 글이 생성됩니다."
            />
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <label className="text-sm font-semibold text-slate-300">
                    블로그 제목 아이디어
                  </label>
                  <WriteInfoToolTip text="독자의 관심을 끌 수 있는 키워드를 포함한 제목을 입력하세요." />
                </div>
                <input
                  className={inputBase}
                  placeholder="예: useMemo를 활용한 React 성능 최적화 방법"
                  type="text"
                  value={blogTitleValue}
                  onChange={(e) => setBlogTitleValue(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <label className="text-sm font-semibold text-slate-300">
                    상세 설명 (AI 컨텍스트)
                  </label>
                  <WriteInfoToolTip text="다루고 싶은 내용을 간략히 설명하세요. 특정 라이브러리, 버전, 또는 상황을 명시하면 좋습니다." />
                </div>
                <textarea
                  className={`${inputBase} resize-none`}
                  placeholder="어떤 내용을 다루고 싶은지 간단히 설명해 주세요..."
                  rows={4}
                  value={blogDescriptionValue}
                  onChange={(e) => setBlogDescriptionValue(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* 3. 핵심 키워드 */}
          <WriteKeyWord keywords={keywords} setKeywords={setKeywords} />

          {isStreaming && (
            <section
              className={`${sectionCard} border-amber-500/30 ring-1 ring-amber-500/20`}>
              <div className="flex items-center gap-2 mb-4">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                </span>
                <h2 className="text-white font-bold text-lg">초안 생성 중…</h2>
              </div>
              {streamPreview.title ? (
                <p className="text-amber-200/90 font-semibold text-base mb-3">
                  {streamPreview.title}
                </p>
              ) : (
                <p className="text-slate-500 text-sm mb-3">
                  제목과 본문이 흐름에 맞게 채워집니다.
                </p>
              )}
              <div className="markdown max-h-[min(28rem,50vh)] overflow-y-auto rounded-lg border border-slate-700/80 bg-slate-950/50 p-4 prose-invert max-w-none text-sm">
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
          )}

          {/* CTA */}
          <BottomCta
            selectedTemplate={selectedTemplate}
            blogTitleValue={blogTitleValue}
            blogDescriptionValue={blogDescriptionValue}
            keywords={keywords}
            setIsLoading={setIsLoading}
            setGeneratedArticle={setGeneratedArticle}
            onStreamBegin={() => {
              setIsStreaming(true);
              setStreamPreview({ title: "", content: "" });
            }}
            onStreamDelta={setStreamPreview}
            onStreamComplete={() => setIsStreaming(false)}
          />
        </section>
      </div>
    </main>
  );
}
