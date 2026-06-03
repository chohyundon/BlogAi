"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SyntaxHighlighter from "react-syntax-highlighter";
import { prism } from "react-syntax-highlighter/dist/esm/styles/prism";
import "@/features/post-view/ui/markDown.css";
import { ChevronRight } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import {
  invalidatePost,
  useQueryPost,
} from "@/features/post-view/lib/postWrite";
import { updatePost } from "@/features/post-view/lib/postEdit";
import PostButton from "@/features/post-view/ui/PostButton";

export default function PostScreen({ postId }: { postId?: string }) {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQueryPost(postId);

  const [title, setTitle] = useState("기술 블로그 포스트 - 2024 AI 트렌드");
  const [content, setContent] = useState("");
  const [templateType, setTemplateType] = useState("");

  useEffect(() => {
    if (!data) return;
    setTitle(data.title);
    setContent(data.content);
    setTemplateType(data.template_type);
  }, [data]);

  const handleEdit = async () => {
    if (!postId) return;
    try {
      await updatePost(postId, content, title);
      toast.success("포스트가 수정되었습니다.");
      await invalidatePost(queryClient, postId);
    } catch {
      toast.error("포스트 수정에 실패했습니다.");
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
      selection.toString();
    }
  };

  if (isLoading) {
    return (
      <main className="flex-1 flex flex-col max-w-[1600px] mx-auto w-full px-4 sm:px-6 bg-navy-950 min-h-full">
        <div className="flex items-center justify-center flex-1 py-24">
          <p className="text-white text-lg font-semibold">로딩중...</p>
        </div>
      </main>
    );
  }

  if (isError || !postId) {
    return (
      <main className="flex-1 flex flex-col max-w-[1600px] mx-auto w-full px-4 sm:px-6 bg-navy-950 min-h-full">
        <div className="flex items-center justify-center flex-1 py-24">
          <p className="text-red-300 text-sm">
            {error instanceof Error
              ? error.message
              : "포스트를 불러오지 못했습니다."}
          </p>
        </div>
      </main>
    );
  }

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
        <PostButton handleDownload={handleDownload} handleEdit={handleEdit} />
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
