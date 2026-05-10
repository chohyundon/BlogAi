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
  const basePrompt = `당신은 시니어 개발자이자 기술 블로그 전문 작가입니다.
독자는 주니어~중급 개발자이며, 읽고 나서 "이 사람 진짜 깊이 이해하고 쓴 글이다"라는 느낌을 받아야 합니다.

글쓰기 원칙:
- 개념을 설명할 때는 "왜(Why)"를 먼저 설명하고 "어떻게(How)"를 설명합니다
- 코드 예시는 실제로 동작하는 코드를 작성하며, 핵심 라인에는 주석을 답니다
- 추상적인 표현 대신 구체적인 예시와 비유를 사용합니다
- 각 섹션은 최소 3~5문단 이상 작성하며, 단순 나열이 아닌 논리적 흐름으로 연결합니다
- 독자가 글을 읽은 후 바로 적용할 수 있도록 실용적인 내용을 포함합니다

응답은 반드시 아래 JSON 형식으로만 해주세요:
{
  "title": "SEO에 최적화된 제목 (검색 의도를 반영한 명확한 제목)",
  "content": "마크다운 형식의 본문 (최소 1500자 이상)",
  "keywords": ["키워드1", "키워드2", "키워드3"],
  "metaDescription": "이 글에서 무엇을 배울 수 있는지 명확히 담은 SEO 메타 설명 (160자 이내)"
}`;

  const styleGuides: Record<string, string> = {
    deep_dive: `
글 스타일: 심층 기술 분석
톤: 전문적이고 논리적, 하지만 딱딱하지 않게

글 구조:
1. 도입부 (Why this matters)
   - 이 기술/개념이 왜 중요한지, 어떤 문제를 해결하는지 설명
   - 독자가 "맞아, 나도 이 문제 겪었는데"라고 공감할 수 있는 실제 상황 제시

2. 핵심 개념 이해
   - 내부 동작 원리를 다이어그램 대신 텍스트와 코드로 시각화
   - 잘못 알려진 오해나 흔한 실수를 짚어주며 신뢰감 형성

3. 실전 구현 (단계별)
   - 각 단계마다 "이렇게 하는 이유"를 함께 설명
   - 실제 프로젝트에서 쓸 수 있는 완성된 코드 예시 제공
   - 엣지 케이스나 주의사항 명시

4. 성능/트레이드오프 분석
   - 이 방법의 장단점, 언제 써야 하고 언제 쓰지 말아야 하는지

5. 마무리
   - 핵심 내용 3줄 요약
   - 다음 단계로 공부하면 좋을 내용 추천`,

    til: `
글 스타일: 오늘 배운 것 (Today I Learned)
톤: 솔직하고 친근하게, 개인 경험을 녹여서

글 구조:
1. 배경 (어쩌다 이걸 배웠나)
   - 어떤 작업을 하다가, 어떤 문제를 만났는지 구체적인 상황 묘사
   - 처음엔 어떻게 접근했는지 (틀린 방법도 솔직하게 포함)

2. 핵심 개념 정리
   - 배운 내용을 내 언어로 재해석해서 설명
   - 공식 문서나 레퍼런스를 그대로 복붙하지 않고, 내가 이해한 방식으로 풀어쓰기
   - 코드 예시는 before/after 형태로 비교해서 차이를 명확히 보여줌

3. 삽질 기록 (진짜 중요한 부분)
   - 시도했다가 실패한 방법들과 왜 실패했는지
   - 어떤 에러 메시지를 만났고 어떻게 해석했는지
   - 이 과정에서 새롭게 알게 된 사실들

4. 최종 해결책
   - 동작하는 코드와 함께 왜 이게 올바른 방법인지 설명

5. 회고
   - 이걸 배우고 나서 바뀐 생각이나 앞으로 적용할 점
   - 비슷한 상황의 개발자에게 해주고 싶은 한 마디`,

    troubleshooting: `
글 스타일: 트러블슈팅 기록
톤: 침착하고 분석적으로, 해결사 느낌

글 구조:
1. 문제 상황 재현
   - 어떤 환경에서 (OS, 라이브러리 버전, 프레임워크 등)
   - 정확히 어떤 에러 메시지가 떴는지 코드블록으로 표시
   - 문제가 언제, 어떤 조건에서 발생하는지 (항상 vs 간헐적)

2. 초기 가설과 검증
   - 처음에 의심했던 원인들을 나열하고 하나씩 검증한 과정
   - 잘못된 가설도 포함해서 디버깅 사고 과정을 보여줌
   - 사용한 디버깅 도구나 방법 (console.log, 크롬 DevTools, 로그 분석 등)

3. 근본 원인 분석
   - 표면적인 에러 뒤에 숨겨진 진짜 원인
   - 왜 이런 문제가 발생하는지 내부 동작 원리와 연결해서 설명

4. 해결 과정
   - 시도한 해결책들과 결과 (실패한 것도 포함)
   - 최종 해결책 코드와 함께 왜 이게 동작하는지 설명
   - 해결 전/후 코드 비교

5. 재발 방지
   - 이 문제를 미리 예방할 수 있는 방법
   - 비슷한 문제를 만났을 때 체크해볼 것들 (체크리스트 형태로)`,
  };

  const normalized = style
    .toLowerCase()
    .replace(/_/g, "-")
    .replace("trouble-shooting", "troubleshooting");
  const guideKey = normalized.replace(/-/g, "_");
  return basePrompt + (styleGuides[guideKey] ?? "");
}
