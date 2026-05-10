"use client";

import { useAuthStore } from "@/features/auth/model/AuthStore";
import Logo from "@/shared/ui/Logo";
import Link from "next/link";
import { DashBoardSideList } from "@/shared/config/DashBoardSideList";
import { createClient } from "@/shared/api/supabase/client";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import HeaderModal from "./HeaderModal";
import AuthModal from "@/features/auth/ui/AuthModal";

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const supabase = createClient();

  // 홈에서는 Aside가 마운트되지 않아서, Header에서 세션 복원 및 구독
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
    if (user) setModalOpen(false);
  }, [user]);

  const handleLogout = async () => {
    setModalOpen(true);
  };

  const handleLogin = () => {
    setModalOpen(true);
  };

  return (
    <header className="flex h-1/14 items-center gap-4 sm:gap-6 w-full p-4 sm:p-6 border-b-2 border-navy-700 relative">
      {modalOpen && user && <HeaderModal setModalOpen={setModalOpen} />}
      {modalOpen && !user && (
        <AuthModal
          setOpenModal={setModalOpen}
          isHomePage={true}
          modalRef={modalRef as React.RefObject<HTMLDivElement>}
        />
      )}
      {onMenuClick && (
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800 transition-colors"
          aria-label="메뉴 열기">
          <svg
            className="size-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      )}
      <Logo />
      <div className="hidden md:flex gap-4 ml-auto items-center">
        {DashBoardSideList.map((item) => (
          <Link
            key={item.id}
            href={`/${item.id}`}
            className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900">
            <p className="text-sm font-medium text-slate-200 hover:text-white transition-colors">
              {item.name}
            </p>
          </Link>
        ))}
      </div>
      <div className="flex md:contents gap-2 items-center ml-auto">
        {user?.user_metadata?.avatar_url ? (
          <img
            src={user?.user_metadata?.avatar_url}
            alt="유저프로필이미지"
            className="size-8 rounded-full object-cover shrink-0 cursor-pointer"
            onClick={handleLogout}
          />
        ) : (
          <div
            className="flex items-center justify-center shrink-0 text-slate-300 cursor-pointer bg-navy-500 rounded-full p-2"
            onClick={handleLogin}>
            <p className="text-sm font-medium text-slate-200 hover:text-white transition-colors">
              로그인
            </p>
          </div>
        )}
      </div>
    </header>
  );
}
