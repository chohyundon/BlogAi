"use client";

import { DashBoardSideList } from "@/shared/config/DashBoardSideList";
import { createClient } from "@/shared/api/supabase/client";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { CircleUserRound, LogOut, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Modal from "@/shared/ui/Modal";
import AuthModal from "@/features/auth/ui/AuthModal";
import { useAuthStore } from "@/features/auth/model/AuthStore";
import { usePathname, useRouter } from "next/navigation";

type AsideProps = {
  open?: boolean;
  onClose?: () => void;
};

export default function Aside({ open = true, onClose }: AsideProps) {
  const pathname = usePathname();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();

  const segment = pathname.replace(/^\//, "").split("/")[0] || "";
  const activeItem = DashBoardSideList.some((item) => item.id === segment)
    ? segment
    : "";

  const supabase = createClient();

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  useEffect(() => {
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
      }
    );
    return () => subscription.unsubscribe();
  }, [setUser]);

  useEffect(() => {
    if (user) setOpenModal(false);
  }, [user]);

  useEffect(() => {
    if (openModal) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          modalRef.current &&
          !modalRef.current.contains(event.target as Node)
        ) {
          setOpenModal(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [openModal]);

  const handleActiveItem = (id: string) => {
    router.push(`/${id}`);
    onClose?.();
  };

  return (
    <>
      {/* 모바일: 배경 딤 */}
      {onClose && (
        <div
          className={`fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden ${
            open ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={`
          flex flex-col border-r border-navy-700 bg-navy-900/50
          w-48 sm:w-52 md:w-56
          fixed md:relative inset-y-0 left-0 z-50 md:z-auto
          transform transition-transform duration-200 ease-out
          ${onClose && !open ? "-translate-x-full md:translate-x-0" : "translate-x-0"}
        `}>
        {onClose && (
          <div className="flex items-center justify-end p-2 border-b border-navy-700 md:hidden">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
              aria-label="메뉴 닫기">
              <X className="size-5" />
            </button>
          </div>
        )}
        {openModal && (
          <Modal ref={modalRef as React.RefObject<HTMLDivElement>}>
            <AuthModal setOpenModal={setOpenModal} />
          </Modal>
        )}
        <nav className="flex flex-1 flex-col w-full overflow-y-auto">
          <ul className="flex flex-col gap-2 w-[85%] mx-auto py-2">
            {DashBoardSideList.map((item) => (
              <li
                key={item.id}
                role="button"
                tabIndex={0}
                className={`flex gap-4 items-center text-sm cursor-pointer p-2 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-inset ${
                  activeItem === item.id
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "text-slate-300 hover:bg-navy-800 hover:text-white border border-transparent"
                }`}
                onClick={() => handleActiveItem(item.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleActiveItem(item.id);
                  }
                }}>
                <item.icon />
                {item.name}
              </li>
            ))}
          </ul>
        <div className="mt-auto mb-4 justify-center w-full mx-auto border-t border-navy-700 flex flex-col gap-2">
          {user ? (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-center p-2 rounded-sm">
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="유저프로필이미지"
                    className="size-8 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="size-8 rounded-full bg-navy-600 flex items-center justify-center shrink-0">
                    <CircleUserRound className="size-5 text-slate-300" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate text-slate-400">
                    {user.user_metadata?.full_name ?? user.email ?? "사용자"}
                  </p>
                  {user.email && (
                    <p className="text-xs text-slate-400 truncate">
                      {user.email}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex gap-2 items-center cursor-pointer p-2 rounded-sm hover:bg-navy-800 w-full text-left text-red-400 hover:text-red-300">
                <LogOut className="shrink-0 size-4" />
                <span className="text-sm">로그아웃</span>
              </button>
            </div>
          ) : (
            <div
              className="flex gap-2 items-center cursor-pointer p-2 rounded-sm text-slate-300 hover:bg-navy-800 hover:text-white"
              onClick={handleOpenModal}>
              <CircleUserRound className="shrink-0" />
              <p>로그인</p>
            </div>
          )}
        </div>
      </nav>
    </aside>
    </>
  );
}
