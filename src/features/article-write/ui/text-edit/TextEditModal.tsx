"use client";

import { X } from "lucide-react";

export default function TextEditModal({
  position,
  setTextEditModalOpen,
}: {
  setTextEditModalOpen: (open: boolean) => void;
  position: { top: number; left: number };
}) {
  return (
    <div
      className="fixed inset-0 z-50"
      onClick={() => setTextEditModalOpen(false)}
      aria-hidden>
      <div
        style={{
          position: "absolute",
          left: position.left,
          top: position.top,
          zIndex: 51,
        }}
        className="bg-navy-900 border border-navy-700 rounded-2xl shadow-xl w-1/5 overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-700">
          <h2 className="text-lg font-bold text-white">텍스트 수정</h2>
          <button
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:bg-navy-700 hover:text-white transition-colors"
            onClick={() => setTextEditModalOpen(false)}
            aria-label="닫기">
            <X className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
