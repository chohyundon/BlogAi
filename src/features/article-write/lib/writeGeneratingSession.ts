export const WRITE_GENERATING_SESSION_KEY = "self:write-generating";

export type WriteGeneratingPayload = {
  selectedTemplate: string;
  blogTitleValue: string;
  blogDescriptionValue: string;
  keywords: string[];
};

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

/** 생성 페이지로 넘기기 전에 호출 */
/** 세션에다가 저장하는 함수 */
export function saveWriteGeneratingPayload(p: WriteGeneratingPayload): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(WRITE_GENERATING_SESSION_KEY, JSON.stringify(p));
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

export function clearWriteGeneratingPayload(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(WRITE_GENERATING_SESSION_KEY);
}
