export function parseBlogGenerationBody(body: Record<string, unknown>): {
  topicStr: string;
  description: string;
  keywords: string[];
  styleKey: string;
} {
  const {
    topic,
    keywords: rawKeywords,
    style: rawStyle,
    blogTitleValue,
    blogDescriptionValue,
    selectedTemplate,
  } = body;

  const topicStr =
    typeof topic === "string"
      ? topic
      : typeof blogTitleValue === "string"
      ? blogTitleValue
      : "";
  const description =
    typeof blogDescriptionValue === "string" ? blogDescriptionValue : "";
  const keywords = Array.isArray(rawKeywords)
    ? rawKeywords.map((k) => String(k))
    : [];
  const styleKey =
    typeof rawStyle === "string"
      ? rawStyle.toLowerCase()
      : typeof selectedTemplate === "string"
      ? selectedTemplate
          .toLowerCase()
          .replace(/_/g, "-")
          .replace("trouble-shooting", "troubleshooting")
      : "tutorial";

  return { topicStr, description, keywords, styleKey };
}

export function buildUserPrompt(
  topicStr: string,
  description: string,
  keywords: string[]
): string {
  return `
주제: ${topicStr}
${description ? `상세 설명: ${description}\n` : ""}
키워드: ${keywords.length ? keywords.join(", ") : "(없음)"}

위 주제와 키워드를 바탕으로 기술 블로그 글을 작성해주세요.
`.trim();
}

export function getSystemPrompt(style: string): string {
  const basePrompt = `당신은 기술 블로그 전문 작가입니다.
사용자가 제공한 주제와 키워드를 바탕으로 기술 블로그 글을 작성합니다. 그리고 너무 성의없게 작성하지 않고 
글을 읽은 유저가 오 그래도 꽤 생각해서 작성했네 

응답은 반드시 아래 JSON 형식으로만 해주세요:
{
  "title": "SEO에 최적화된 제목",
  "content": "마크다운 형식의 본문",
  "keywords": ["키워드1", "키워드2", "키워드3"],
  "metaDescription": "SEO 메타 설명 (160자 이내)"
}`;

  const styleGuides: Record<string, string> = {
    deep_dive: `
글 구조:
1. 개요: 무엇을 배울 수 있는지 소개
2. 사전 준비: 필요한 환경/지식
3. Step 1, 2, 3...: 단계별 설명 (코드 예시 포함) 좀 자세하게 설명좀 해줘
4. 마무리: 요약 및 다음 학습 방향`,
    til: `
글 구조:
1. 오늘 배운 것: 핵심 개념 요약
2. 상세 내용: 코드 예시와 함께 설명  좀 자세하게 설명좀 해줘
3. 어려웠던 점: 겪은 문제와 해결 과정
4. 느낀 점: 개인적인 소감`,
    troubleshooting: `
글 구조:
1. 문제 상황: 발생한 에러/문제 설명
2. 원인 분석: 왜 이 문제가 발생했는지 좀 자세하게 설명좀 해줘
3. 해결 방법: 단계별 해결 과정 (코드 포함)
4. 결론: 배운 점과 예방법`,
  };

  const normalized = style
    .toLowerCase()
    .replace(/_/g, "-")
    .replace("trouble-shooting", "troubleshooting");
  const guideKey = normalized.replace(/-/g, "_");
  return basePrompt + (styleGuides[guideKey] ?? "");
}
