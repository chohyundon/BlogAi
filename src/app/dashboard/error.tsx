"use client";

import { useEffect } from "react";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] gap-4">
      <p className="text-red-400 text-lg font-semibold">
        {error.message || "오류가 발생했습니다."}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors">
        다시 시도
      </button>
    </div>
  );
}
