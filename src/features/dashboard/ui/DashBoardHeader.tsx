"use client";

import { useAuthStore } from "@/features/auth/model/AuthStore";
import { ToastContainer } from "react-toastify";
import Link from "next/link";

export default function DashBoardHeader() {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="flex flex-wrap justify-between items-end gap-6 mb-12">
      <div className="flex flex-col gap-2">
        <h2 className="text-white text-4xl font-black">
          어서오세요, {`${user?.user_metadata?.full_name} 님`}
        </h2>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="dark"
      />
      <Link
        className="inline-block px-4 py-2 font-bold shadow-lg bg-amber-500 hover:bg-amber-600 transition-all text-white rounded-lg"
        href="/write"
        aria-label="새로운 글 작성">
        새로운 글 작성
      </Link>
    </header>
  );
}
