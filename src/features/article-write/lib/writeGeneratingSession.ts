import type { GeneratedArticle } from "@/entities/article/model/generatedArticle";
import {
  WRITE_GENERATING_ENTRY_COOKIE,
  WRITE_GENERATING_ENTRY_MAX_AGE_SEC,
  WRITE_GENERATING_ENTRY_VALUE,
} from "@/shared/config/writeGeneratingEntry";

export const WRITE_GENERATING_SESSION_KEY = "self:write-generating";
export const WRITE_GENERATION_STATUS_KEY = "self:write-generation-status";
export const WRITE_GENERATION_RESULT_KEY = "self:write-generation-result";
export const GENERATION_STATUS_CHANGE_EVENT = "write-generation-status-change";

export type WriteGeneratingPayload = {
  selectedTemplate: string;
  blogTitleValue: string;
  blogDescriptionValue: string;
  keywords: string[];
};

export type GenerationStatus = "generating" | "done" | "error";

function isPayload(v: unknown): v is WriteGeneratingPayload {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.selectedTemplate === "string" &&
    typeof o.blogTitleValue === "string" &&
    typeof o.blogDescriptionValue === "string" &&
    Array.isArray(o.keywords) &&
    o.keywords.every((k) => typeof k === "string")
  );
}

function isGenerationStatus(v: string): v is GenerationStatus {
  return v === "generating" || v === "done" || v === "error";
}

function isGeneratedArticle(v: unknown): v is GeneratedArticle {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.title === "string" &&
    typeof o.content === "string" &&
    Array.isArray(o.keywords) &&
    o.keywords.every((k) => typeof k === "string") &&
    typeof o.template === "string"
  );
}

function notifyGenerationStatusChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(GENERATION_STATUS_CHANGE_EVENT));
}

/** 생성 페이지로 넘기기 전에 호출 */
export function saveWriteGeneratingPayload(
  payload: WriteGeneratingPayload
): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(WRITE_GENERATING_SESSION_KEY, JSON.stringify(payload));
}

function setEntryCookie(): void {
  document.cookie = [
    `${WRITE_GENERATING_ENTRY_COOKIE}=${WRITE_GENERATING_ENTRY_VALUE}`,
    "path=/",
    `max-age=${WRITE_GENERATING_ENTRY_MAX_AGE_SEC}`,
    "SameSite=Lax",
  ].join("; ");
}

function clearEntryCookie(): void {
  document.cookie = [
    `${WRITE_GENERATING_ENTRY_COOKIE}=`,
    "path=/",
    "max-age=0",
  ].join("; ");
}

/** 생성 페이지로 넘기기 전에 호출 (proxy가 1회 소비) */
export function grantGeneratingPageEntry(): void {
  if (typeof document === "undefined") return;
  setEntryCookie();
}

export function revokeGeneratingPageEntry(): void {
  if (typeof document === "undefined") return;
  clearEntryCookie();
}

export function setGenerationStatus(status: GenerationStatus): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(WRITE_GENERATION_STATUS_KEY, status);
  notifyGenerationStatusChange();
}

export function getGenerationStatus(): GenerationStatus | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(WRITE_GENERATION_STATUS_KEY);
  if (!raw || !isGenerationStatus(raw)) return null;
  return raw;
}

export function clearGenerationStatus(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(WRITE_GENERATION_STATUS_KEY);
  notifyGenerationStatusChange();
}

/** 세션에서 읽기만 함 (생성 완료·오류 시 clearWriteGeneratingPayload 로 비움) */
export function peekWriteGeneratingPayload(): WriteGeneratingPayload | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(WRITE_GENERATING_SESSION_KEY);
  if (!raw) return null;
  try {
    const data: unknown = JSON.parse(raw);
    return isPayload(data) ? data : null;
  } catch {
    return null;
  }
}

export function saveGenerationResult(article: GeneratedArticle): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(WRITE_GENERATION_RESULT_KEY, JSON.stringify(article));
}

export function peekGenerationResult(): GeneratedArticle | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(WRITE_GENERATION_RESULT_KEY);
  if (!raw) return null;
  try {
    const data: unknown = JSON.parse(raw);
    return isGeneratedArticle(data) ? data : null;
  } catch {
    return null;
  }
}

export function clearGenerationResult(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(WRITE_GENERATION_RESULT_KEY);
}

export function clearWriteGeneratingPayload(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(WRITE_GENERATING_SESSION_KEY);
  clearGenerationStatus();
  clearGenerationResult();
  revokeGeneratingPageEntry();
}
