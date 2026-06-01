"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SyntaxHighlighter from "react-syntax-highlighter";
import { lucario } from "react-syntax-highlighter/dist/esm/styles/prism";
import "@/features/post-view/ui/markDown.css";

type ArticleMarkdownViewProps = {
  content: string;
};

export default function ArticleMarkdownView({ content }: ArticleMarkdownViewProps) {
  return (
    <div className="prose prose-invert max-w-none">
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
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
