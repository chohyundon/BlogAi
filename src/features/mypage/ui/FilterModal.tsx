"use client";

import { useFilterStore } from "@/features/mypage/model/FilterStore";
import { DatabaseDocument } from "@/shared/types/database";
import { Check } from "lucide-react";
import { useEffect, useRef } from "react";

export default function FilterModal({
  setFilterModalOpen,
  templates,
}: {
  setFilterModalOpen: (open: boolean) => void;
  templates: DatabaseDocument[];
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const selectedTemplateType = useFilterStore(
    (state) => state.selectedTemplateType
  );
  const setSelectedTemplateType = useFilterStore(
    (state) => state.setSelectedTemplateType
  );
  const templateTypes = [
    "전체",
    ...new Set(templates.map((template) => template.template_type)),
  ];

  const handleSelectTemplateType = async (templateType: string) => {
    setSelectedTemplateType(templateType);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        setFilterModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setFilterModalOpen]);

  const templateTypeStyle = (type: string) => {
    if (type === "TIL")
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    if (type === "Deep_Dive")
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    if (type === "Trouble_Shooting")
      return "bg-amber-500/10 text-amber-300 border-amber-500/25";
    return "bg-navy-700/80 text-slate-400 border-navy-600";
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        aria-hidden
        onClick={() => setFilterModalOpen(false)}
      />
      <div
        ref={contentRef}
        className="absolute right-0 top-12 z-50 min-w-[200px] rounded-xl border border-navy-700 bg-navy-900 shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        <div className="px-4 py-3 border-b border-navy-700">
          <p className="text-xs font-bold uppercase tracking-wider text-white">
            템플릿 필터
          </p>
        </div>
        <ul className="py-1">
          {templateTypes.map((templateType) => (
            <li key={templateType}>
              <button
                type="button"
                onClick={() => handleSelectTemplateType(templateType)}
                className="cursor-pointer flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm font-medium text-slate-200 hover:bg-navy-800 transition-colors">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${templateTypeStyle(
                    templateType
                  )}`}>
                  {templateType}
                </span>
                {templateType === selectedTemplateType && (
                  <Check className="size-4" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
