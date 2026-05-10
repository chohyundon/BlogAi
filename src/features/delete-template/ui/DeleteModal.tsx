"use client";

import { useEffect } from "react";

export default function DeleteModal({
  targetId,
  setDeleteModalOpen,
  modalRef,
  onConfirm,
}: {
  targetId: string | null;
  setDeleteModalOpen: (open: boolean) => void;
  modalRef: React.RefObject<HTMLDivElement>;
  onConfirm: (id: string) => void;
}) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setDeleteModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [modalRef, setDeleteModalOpen]);

  const handleDelete = () => {
    if (targetId) {
      onConfirm(targetId);
    }
    setDeleteModalOpen(false);
  };

  return (
    <div
      className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) =>
        e.target === e.currentTarget && setDeleteModalOpen(false)
      }>
      <div
        ref={modalRef}
        className="bg-navy-900 border border-navy-700 rounded-2xl shadow-xl w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4">
          <h2 className="text-xl font-bold text-white">포스트 삭제</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            정말로 이 포스트를 삭제하시겠습니까?
          </p>
        </div>
        <div className="flex gap-2 px-6 py-4">
          <button
            className="w-full py-3 px-4 rounded-xl bg-blue-800 text-white font-medium hover:opacity-80 transition-colors"
            onClick={handleDelete}>
            삭제
          </button>
          <button
            type="button"
            className="w-full py-3 px-4 rounded-xl bg-navy-600 text-white font-medium hover:opacity-80 transition-colors"
            onClick={() => setDeleteModalOpen(false)}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
