"use client";

import { useState } from "react";
import Button from "@/shared/ui/Button";
import { TEMPLATES } from "@/entities/template/config/Template";
import WriteSectionHeader from "@/features/article-write/ui/Header/WriteSectionHeader";
import WriteInfoToolTip from "@/features/article-write/ui/infoTooltip/WriteInfoToolTip";
import { CheckCircle } from "lucide-react";
import {
  NAVY,
  dashboardWriteStyles,
} from "@/features/article-write/ui/dashboardWriteStyles";
import { useRouter } from "next/navigation";
import WriteKeyWord from "@/features/article-write/ui/keyword/WriteKeyWord";
import BottomCta from "@/features/article-write/ui/bottom/BottomCta";

export default function DashBoardWrite() {
  const router = useRouter();
  const { inputBase, sectionCard, templateCardBase } = dashboardWriteStyles;

  const [selectedTemplate, setSelectedTemplate] = useState<string>("TIL");
  const [blogTitleValue, setBlogTitleValue] = useState<string>("");
  const [blogDescriptionValue, setBlogDescriptionValue] = useState<string>("");
  const [keywords, setKeywords] = useState<string[]>([
    "React",
    "성능 최적화",
    "프론트엔드",
  ]);

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
              아래 세부 정보를 입력한 뒤 생성 화면에서 AI 초안을 확인하세요.
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

          <BottomCta
            selectedTemplate={selectedTemplate}
            blogTitleValue={blogTitleValue}
            blogDescriptionValue={blogDescriptionValue}
            keywords={keywords}
          />
        </section>
      </div>
    </main>
  );
}
