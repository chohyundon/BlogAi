"use client";

import { DatabaseDocument } from "@/shared/types/database";
import { useEffect, useRef, useState } from "react";
import DeleteModal from "@/features/delete-template/ui/DeleteModal";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import { useFilterStore } from "@/features/mypage/model/FilterStore";
import { useAuthStore } from "@/features/auth/model/AuthStore";
import { getUserData } from "@/entities/user/api/getUserData";
import { deleteTemplate } from "@/entities/template/api/deleteTemplate";
import { TEMPLATES_PER_PAGE } from "@/entities/template/config/Template";
import MypageToolbar from "./MypageToolbar";
import MypagePostsTable from "./MypagePostsTable";
import MypagePagination from "./MypagePagination";
import {
  filterPostsByTypeAndSearch,
  sortPostsByCreatedDesc,
} from "@/features/mypage/lib/postList";

export default function MypageScreen() {
  const [templates, setTemplates] = useState<DatabaseDocument[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedTemplateType = useFilterStore(
    (state) => state.selectedTemplateType
  );
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setTemplates([]);
      setIsLoading(false);
      return;
    }
    const load = async () => {
      setIsLoading(true);
      const data = await getUserData(user.id);
      setTemplates(data ?? []);
      setCurrentPage(0);
      setIsLoading(false);
    };
    load();
  }, [user?.id]);

  useEffect(() => {
    setCurrentPage(0);
  }, [selectedTemplateType]);

  const openDeleteModal = (id: string) => {
    setDeleteTargetId(id);
    setDeleteModalOpen(true);
  };

  const handleEditPost = (id: string) => {
    router.push(`/post/${id}`);
  };

  const handleConfirmDelete = async (id: string) => {
    const error = await deleteTemplate(id);
    if (error) {
      console.error(error);
    } else {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast.success("포스트가 삭제되었습니다.");
    }
    setDeleteTargetId(null);
  };

  const filteredTemplates = filterPostsByTypeAndSearch(
    templates,
    selectedTemplateType,
    searchQuery
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTemplates.length / TEMPLATES_PER_PAGE)
  );
  const rangeStart = currentPage * TEMPLATES_PER_PAGE;
  const sortedTemplates = sortPostsByCreatedDesc(filteredTemplates);
  const currentPageItems = sortedTemplates.slice(
    rangeStart,
    rangeStart + TEMPLATES_PER_PAGE
  );

  const handleSearchQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0);
  };

  if (isLoading) {
    return (
      <main className="flex-1 ml-2 p-8 bg-navy-950 min-h-full">
        <div className="flex items-center justify-center h-full">
          <p className="text-white text-2xl font-bold">로딩중...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 ml-2 p-8 bg-navy-950 min-h-full">
      {deleteModalOpen && (
        <DeleteModal
          targetId={deleteTargetId}
          setDeleteModalOpen={setDeleteModalOpen}
          modalRef={modalRef as React.RefObject<HTMLDivElement>}
          onConfirm={handleConfirmDelete}
        />
      )}
      {!user && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm">
          글을 저장하려면 로그인이 필요합니다. 상단 또는 왼쪽 사이드바에서
          로그인해 주세요.
        </div>
      )}
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="dark"
      />
      <header className="flex flex-col gap-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">내 블로그 글 목록</h2>
            <p className="text-slate-400 text-sm">
              총 {templates.length}개의 기술 포스트를 관리하고 있습니다.
            </p>
          </div>
        </div>

        <MypageToolbar
          searchQuery={searchQuery}
          onSearchChange={handleSearchQuery}
          selectedTemplateType={selectedTemplateType}
          filterModalOpen={filterModalOpen}
          setFilterModalOpen={setFilterModalOpen}
          templates={templates}
        />
      </header>

      <div className="bg-navy-900 border border-navy-700 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-y-auto">
          {user ? (
            <MypagePostsTable
              items={currentPageItems}
              onEdit={handleEditPost}
              onDelete={openDeleteModal}
            />
          ) : null}
        </div>
        <MypagePagination
          isLoggedIn={!!user}
          filteredCount={filteredTemplates.length}
          currentPage={currentPage}
          totalPages={totalPages}
          rangeStart={rangeStart}
          onPageChange={setCurrentPage}
          onPrev={() => setCurrentPage((p) => Math.max(0, p - 1))}
          onNext={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
        />
      </div>
    </main>
  );
}
