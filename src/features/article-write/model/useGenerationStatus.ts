"use client";

import { useSyncExternalStore } from "react";
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
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
