"use client";

import { MOCK_TEMPLATES } from "@/entities/template/mocks/mock";
import ReactMarkdown from "react-markdown";
import SyntaxHighlighter from "react-syntax-highlighter";
import remarkGfm from "remark-gfm";
import "@/features/post-view/ui/markDown.css";
import { lucario } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useParams } from "next/navigation";

export default function TemplateId() {
  const params = useParams();
  const id = params.id as string;

  const content = MOCK_TEMPLATES[0].filter((t) => t.id === id);

  return (
    <main className="flex-1 p-6 sm:p-8 w-full min-h-full bg-navy-950 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 mb-4">
            TIL 템플릿
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight">
            템플릿 예시
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            실제 포스트에 적용되는 TIL 형식 미리보기입니다.
          </p>
        </header>

        <article className="rounded-xl border border-navy-700 bg-navy-900 shadow-lg">
          <div className="markdown overflow-y-auto p-6 sm:p-8 prose-invert max-w-none">
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
                        margin: "0.75rem 0",
                        padding: "1rem",
                        background: "#292961",
                        fontSize: "0.8125rem",
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
              {content[0].content}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </main>
  );
}
