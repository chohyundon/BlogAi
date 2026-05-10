"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { TEMPLATES_PER_PAGE } from "@/entities/template/config/Template";
import Button from "@/shared/ui/Button";

type MypagePaginationProps = {
  isLoggedIn: boolean;
  filteredCount: number;
  currentPage: number;
  totalPages: number;
  rangeStart: number;
  onPageChange: (page: number) => void;
  onPrev: () => void;
  onNext: () => void;
};

export default function MypagePagination({
  isLoggedIn,
  filteredCount,
  currentPage,
  totalPages,
  rangeStart,
  onPageChange,
  onPrev,
  onNext,
}: MypagePaginationProps) {
  if (!isLoggedIn) {
    return (
      <div className="px-6 py-4 bg-navy-800/50 flex items-center justify-between border-t border-navy-700">
        <p className="text-sm text-slate-500">0 posts</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-4 bg-navy-800/50 flex items-center justify-between border-t border-navy-700">
      <p className="text-sm text-slate-500">
        {filteredCount > 0
          ? `Showing ${rangeStart + 1} to ${Math.min(
              rangeStart + TEMPLATES_PER_PAGE,
              filteredCount
            )} of ${filteredCount}`
          : "0 posts"}
      </p>
      <div className="flex items-center gap-1">
        <Button
          className="p-2 rounded-lg hover:bg-navy-700 text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          isDisabled={currentPage === 0}
          onClick={onPrev}>
          <ArrowLeft className="size-4" />
        </Button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            type="button"
            key={i}
            className={`size-8 rounded-lg font-medium text-sm transition-colors ${
              currentPage === i
                ? "bg-amber-500 text-navy-950"
                : "hover:bg-navy-700 text-slate-300"
            }`}
            onClick={() => onPageChange(i)}>
            {i + 1}
          </button>
        ))}
        <Button
          className="p-2 rounded-lg hover:bg-navy-700 text-slate-400 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          isDisabled={currentPage >= totalPages - 1}
          onClick={onNext}>
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
