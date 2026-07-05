"use client";

import { useRef, useSyncExternalStore } from "react";
import {
  getGenerationStatus,
  GENERATION_STATUS_CHANGE_EVENT,
  type GenerationStatus,
} from "@/features/article-write/lib/writeGeneratingSession";

function subscribe(onStoreChange: () => void) {
  window.addEventListener(GENERATION_STATUS_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener(GENERATION_STATUS_CHANGE_EVENT, onStoreChange);
  };
}

function getSnapshot(): GenerationStatus | null {
  return getGenerationStatus();
}

function getServerSnapshot(): GenerationStatus | null {
  return null;
}

export function useGenerationStatus() {
  const renderCount = useRef(0);
  renderCount.current += 1;

  const status = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  if (process.env.NODE_ENV === "development") {
    console.log(
      "[generation-status:sync]",
      `render #${renderCount.current}`,
      "status:",
      status,
    );
  }

  return status;
}
