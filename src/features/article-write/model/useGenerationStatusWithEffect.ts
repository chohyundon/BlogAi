"use client";

import { useEffect, useRef, useState } from "react";
import {
  getGenerationStatus,
  GENERATION_STATUS_CHANGE_EVENT,
  type GenerationStatus,
} from "@/features/article-write/lib/writeGeneratingSession";

/**
 * useSyncExternalStore 대비 테스트용.
 * BottomCta import를 이 훅으로 바꾼 뒤 아래 시나리오로 깜빡임을 확인하세요.
 */
export function useGenerationStatusWithEffect() {
  const [status, setStatus] = useState<GenerationStatus | null>(null);
  const renderCount = useRef(0);
  renderCount.current += 1;

  useEffect(() => {
    setStatus(getGenerationStatus());

    const onChange = () => {
      setStatus(getGenerationStatus());
    };

    window.addEventListener(GENERATION_STATUS_CHANGE_EVENT, onChange);
    return () => {
      window.removeEventListener(GENERATION_STATUS_CHANGE_EVENT, onChange);
    };
  }, []);

  if (process.env.NODE_ENV === "development") {
    console.log(
      "[generation-status:effect]",
      `render #${renderCount.current}`,
      "status:",
      status,
    );
  }

  return status;
}
