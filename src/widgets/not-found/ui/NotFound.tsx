"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileQuestion, Home } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-1 w-full items-center justify-center bg-navy-950 px-6 py-16">
      <div className="flex max-w-lg flex-col items-center text-center">
        <div className="mb-8 flex size-20 items-center justify-center rounded-2xl border border-navy-600 bg-navy-800/80">
          <FileQuestion className="size-10 text-amber-400" aria-hidden />
        </div>

        <p className="mb-3 text-7xl font-black tracking-tighter text-white">
          404
        </p>
        <h1 className="mb-4 text-2xl font-bold text-white">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="mb-10 text-base leading-relaxed text-slate-400">
          요청하신 주소가 삭제되었거나, 잘못 입력되었을 수 있습니다.
          <br />
          URL을 다시 확인하거나 홈으로 이동해 주세요.
        </p>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-navy-600 bg-navy-800 px-6 py-3 font-semibold text-slate-200 transition-colors hover:bg-navy-700">
            <ArrowLeft className="size-4" />
            이전 페이지
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-semibold text-white shadow-lg shadow-amber-500/25 transition-colors hover:bg-amber-400">
            <Home className="size-4" />
            홈으로 가기
          </Link>
        </div>
      </div>
    </div>
  );
}
