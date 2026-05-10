"use client";

import { createClient } from "@/shared/api/supabase/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SyntaxHighlighter from "react-syntax-highlighter";
import { prism } from "react-syntax-highlighter/dist/esm/styles/prism";
import "./markDown.css";
import { ChevronRight, Sparkles, FileDown } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
type PostScreenProps = { postId?: string };

export default function PostScreen({ postId }: PostScreenProps) {
  const supabase = createClient();
  const [title, setTitle] = useState<string>(
    "기술 블로그 포스트 - 2024 AI 트렌드"
  );
  const [content, setContent] = useState<string>("");
  const [templateType, setTemplateType] = useState<string>("");

  useEffect(() => {
    if (!postId) return;
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("title, content, template_type")
        .eq("id", postId)
        .single();
      if (!error && data) {
        setTitle(data.title ?? "기술 블로그 포스트 - 2024 AI 트렌드");
        setContent(data.content ?? "");
        setTemplateType(data.template_type ?? "");
      }
    };
    fetchPost();
  }, [postId]);

  const handleEdit = async () => {
    const { error } = await supabase
      .from("posts")
      .update({ content: content.trim() })
      .eq("id", postId)
      .select();
    if (error) {
      toast.error("포스트 수정에 실패했습니다.");
    } else {
      toast.success("포스트가 수정되었습니다.");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.md`;
    a.click();
  };

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection) {
      const selectedText = selection.toString();
    }
  };

  return (
    <main className="flex-1 flex flex-col max-w-[1600px] mx-auto w-full px-4 sm:px-6 bg-navy-950 min-h-full">
      <div className="flex flex-wrap items-center gap-1 mt-4">
        <Link
          className="text-slate-400 text-sm font-medium hover:text-amber-400 hover:underline transition-colors"
          href="/mypage">
          내 포스트
        </Link>
        <ChevronRight className="size-4 text-slate-400" />
        <span className="text-slate-400 text-sm font-medium">
          {templateType}
        </span>
        <ChevronRight className="size-4 text-slate-400" />
        <span className="text-white text-sm font-semibold">{title}</span>
      </div>
      <div className="flex flex-wrap items-center mt-4 justify-between gap-4 px-4 py-2 bg-navy-900 border border-navy-700 rounded-t-xl">
        <button
          onClick={handleDownload}
          className="flex ml-auto items-center justify-center rounded-lg h-9 px-4 bg-blue-500/15 text-blue-400 border border-blue-500/25 hover:opacity-50 cursor-pointer transition-all font-semibold text-sm">
          <FileDown className="size-4 mr-2" />
          <span>다운로드</span>
        </button>
        <button
          onClick={handleEdit}
          className="flex items-center justify-center rounded-lg h-9 px-4 bg-amber-500/15 text-amber-400 border border-amber-500/25 hover:opacity-50 cursor-pointer transition-all font-semibold text-sm">
          <Sparkles className="size-4 mr-2" />
          <span>수정하기</span>
        </button>
        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="dark"
        />
      </div>
      <section className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-px bg-navy-700 border border-t-0 border-navy-700 rounded-b-xl min-h-[600px] mb-8 ">
        <aside className="bg-navy-900 flex flex-col">
          <div className="bg-navy-900 flex flex-col h-full relative">
            <textarea
              onMouseUp={handleMouseUp}
              className="flex-1 relative p-6 bg-transparent border-none focus:ring-0 focus:outline-none text-white font-mono text-sm leading-relaxed resize-none placeholder:text-slate-500"
              spellCheck={false}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="본문을 입력하세요..."
            />
          </div>
        </aside>
        <aside className="markdown overflow-y-auto p-6">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                return match ? (
                  <SyntaxHighlighter
                    language={match[1]}
                    style={prism}
                    customStyle={{ borderRadius: "0.25rem" }}>
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className="inline-code" {...props}>
                    {children}
                  </code>
                );
              },
            }}>
            {content}
          </ReactMarkdown>
        </aside>
      </section>
    </main>
  );
}
