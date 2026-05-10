"use client";

import { ChevronDown } from "lucide-react";
import type { DatabaseDocument } from "@/shared/types/database";
import FilterModal from "./FilterModal";
import Button from "@/shared/ui/Button";

type MypageToolbarProps = {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedTemplateType: string;
  filterModalOpen: boolean;
  setFilterModalOpen: (open: boolean) => void;
  templates: DatabaseDocument[];
};

export default function MypageToolbar({
  searchQuery,
  onSearchChange,
  selectedTemplateType,
  filterModalOpen,
  setFilterModalOpen,
  templates,
}: MypageToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 bg-navy-900 p-4 rounded-xl border border-navy-700 shadow-sm">
      <div className="flex-1">
        <input
          className="w-full pl-4 pr-4 py-2 bg-navy-800/50 border border-navy-600 rounded-lg focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 text-white placeholder:text-slate-500 text-sm outline-none transition-all"
          placeholder="포스트 제목, 태그 검색..."
          type="text"
          value={searchQuery}
          onChange={onSearchChange}
        />
      </div>
      <div className="flex items-center gap-2">
        <div className="relative group">
          {filterModalOpen && (
            <FilterModal
              setFilterModalOpen={setFilterModalOpen}
              templates={templates}
            />
          )}
          <Button
            className="flex items-center gap-2 text-white"
            onClick={() => setFilterModalOpen(true)}>
            템플릿: {selectedTemplateType}
            <ChevronDown className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
