"use client";

import { X } from "lucide-react";
import WriteSectionHeader from "../Header/WriteSectionHeader";
import { dashboardWriteStyles } from "../dashboardWriteStyles";
import { useState } from "react";
import { RECOMMENDED_KEYWORDS } from "@/shared/config/Write";
import Button from "@/shared/ui/Button";
const { inputBase, sectionCard, templateCardBase, keywordTag, suggestionBtn } =
  dashboardWriteStyles;

export default function WriteKeyWord({
  keywords,
  setKeywords,
}: {
  keywords: string[];
  setKeywords: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const [keywordInput, setKeywordInput] = useState("");

  const removeKeyword = (index: number) => {
    setKeywords((prev) => prev.filter((_, i) => i !== index));
  };

  const addKeyword = (word: string) => {
    const trimmed = word.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords((prev) => [...prev, trimmed]);
      setKeywordInput("");
    }
  };

  return (
    <section className={sectionCard}>
      <WriteSectionHeader step={3} title="핵심 키워드" />
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 p-3 bg-slate-800/40 border border-slate-600/50 rounded-lg min-h-[50px]">
          {keywords.map((kw, i) => (
            <span key={`${kw}-${i}`} className={keywordTag}>
              {kw}
              <button
                type="button"
                onClick={() => removeKeyword(i)}
                className="cursor-pointer hover:opacity-80"
                aria-label={`${kw} 제거`}>
                <X className="size-4 text-slate-400 hover:text-white" />
              </button>
            </span>
          ))}
          <input
            className="flex-1 bg-transparent border-none outline-none text-sm text-white min-w-[120px] focus:ring-0 placeholder:text-slate-500"
            placeholder="키워드 추가..."
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addKeyword(keywordInput);
              }
            }}
          />
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <p className="text-xs text-slate-400">추천 키워드:</p>
          <div className="flex gap-2">
            {RECOMMENDED_KEYWORDS.map((kw) => (
              <Button
                key={kw}
                onClick={() => addKeyword(kw)}
                className={suggestionBtn}>
                {kw}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
