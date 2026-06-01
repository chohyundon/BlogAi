import { TEMPLATES } from "@/entities/template/config/Template";

const ALLOWED_TEMPLATE_TYPE = new Set(TEMPLATES.map((t) => t.id as string));

const TITLE_MAX = 500;
const CONTENT_MAX = 500_000;
const KEYWORD_MAX = 60;
const KEYWORD_LEN_MAX = 80;

export type ValidatedPostInsert = {
  title: string;
  content: string;
  keywords: string[];
  template_type: string;
};

export function validatePostInsertBody(
  body: unknown
):
  | { ok: true; value: ValidatedPostInsert }
  | { ok: false; message: string; status: number } {
  if (body === null || typeof body !== "object") {
    return {
      ok: false,
      message: "요청 본문이 올바르지 않습니다.",
      status: 400,
    };
  }

  const o = body as Record<string, unknown>;

  const title = o.title;
  const content = o.content;
  const keywords = o.keywords;
  const template_type = o.template_type;

  if (typeof title !== "string" || !title.trim()) {
    return { ok: false, message: "제목(title)은 필수입니다.", status: 400 };
  }
  const t = title.trim();
  if (t.length > TITLE_MAX) {
    return {
      ok: false,
      message: `제목은 ${TITLE_MAX}자 이하여야 합니다.`,
      status: 400,
    };
  }

  if (typeof content !== "string") {
    return {
      ok: false,
      message: "본문(content)은 문자열이어야 합니다.",
      status: 400,
    };
  }
  if (content.length > CONTENT_MAX) {
    return {
      ok: false,
      message: `본문은 ${CONTENT_MAX}자 이하여야 합니다.`,
      status: 400,
    };
  }

  if (!Array.isArray(keywords)) {
    return { ok: false, message: "keywords는 배열이어야 합니다.", status: 400 };
  }
  if (keywords.length > KEYWORD_MAX) {
    return {
      ok: false,
      message: `키워드는 최대 ${KEYWORD_MAX}개까지 허용됩니다.`,
      status: 400,
    };
  }
  const kw: string[] = [];
  for (const item of keywords) {
    if (typeof item !== "string") {
      return {
        ok: false,
        message: "키워드 항목은 문자열이어야 합니다.",
        status: 400,
      };
    }
    const s = item.trim();
    if (s.length > KEYWORD_LEN_MAX) {
      return {
        ok: false,
        message: `각 키워드는 ${KEYWORD_LEN_MAX}자 이하여야 합니다.`,
        status: 400,
      };
    }
    if (s) kw.push(s);
  }

  if (typeof template_type !== "string" || !template_type.trim()) {
    return {
      ok: false,
      message: "template_type은 필수입니다.",
      status: 400,
    };
  }
  const tt = template_type.trim();
  if (!ALLOWED_TEMPLATE_TYPE.has(tt)) {
    return {
      ok: false,
      message: "지원하지 않는 template_type 입니다.",
      status: 400,
    };
  }

  return {
    ok: true,
    value: { title: t, content, keywords: kw, template_type: tt },
  };
}
