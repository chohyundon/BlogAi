"use client";

import { useEffect, useOptimistic, useRef, useState } from "react";
import DeleteModal from "@/features/delete-template/ui/DeleteModal";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import { useFilterStore } from "@/features/mypage/model/FilterStore";
import { useAuthStore } from "@/features/auth/model/AuthStore";
import { deleteTemplate } from "@/entities/template/api/deleteTemplate";
import { TEMPLATES_PER_PAGE } from "@/entities/template/config/Template";
import MypageToolbar from "@/features/mypage/ui/MypageToolbar";
import MypagePostsTable from "@/features/mypage/ui/MypagePostsTable";
import MypagePagination from "@/features/mypage/ui/MypagePagination";
import {
  filterPostsByTypeAndSearch,
  sortPostsByCreatedDesc,
} from "@/features/mypage/lib/postList";
import {
  useQueryUserData,
  userDataQueryKey,
} from "@/entities/user/api/queryUserData";
import { useQueryClient } from "@tanstack/react-query";
import type { DatabaseDocument } from "@/shared/types/database";

export default function MypageScreen() {
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
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const { data: templatesData = [], isLoading } = useQueryUserData(user?.id);
  const [optimisticTemplates, markTemplateDeleted] = useOptimistic(
    templatesData ?? [],
    (current, postIdToRemove: string) =>
      current.filter((post) => String(post.id) !== postIdToRemove)
  );

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
    const postId = String(id);
    markTemplateDeleted(postId);

    const { error } = await deleteTemplate(postId);
    if (error) {
      toast.error(error);
      throw new Error(error);
    }

    if (user?.id) {
      queryClient.setQueryData<DatabaseDocument[] | null>(
        userDataQueryKey(user.id),
        (old) => old?.filter((post) => String(post.id) !== postId) ?? []
      );
    }

    const nextFiltered = filterPostsByTypeAndSearch(
      (templatesData ?? []).filter((post) => String(post.id) !== postId),
      selectedTemplateType,
      searchQuery
    );
    const nextTotalPages = Math.max(
      1,
      Math.ceil(nextFiltered.length / TEMPLATES_PER_PAGE)
    );
    setCurrentPage((page) => Math.min(page, nextTotalPages - 1));
    setDeleteTargetId(null);
    toast.success("포스트가 삭제되었습니다.");
  };

  const filteredTemplates = filterPostsByTypeAndSearch(
    optimisticTemplates,
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
              총 {optimisticTemplates.length}개의 기술 포스트를 관리하고
              있습니다.
            </p>
          </div>
        </div>

        <MypageToolbar
          searchQuery={searchQuery}
          onSearchChange={handleSearchQuery}
          selectedTemplateType={selectedTemplateType}
          filterModalOpen={filterModalOpen}
          setFilterModalOpen={setFilterModalOpen}
          templates={optimisticTemplates}
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
