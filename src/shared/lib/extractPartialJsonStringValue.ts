/**
 * 불완전한 JSON에서 문자열 값을 추출하는 유틸리티
 * SSE 스트리밍에서 부분적인 응답을 파싱할 때 사용
 */

export function extractPartialJsonStringValue(
  partialJson: string,
  key: string
): string | null {
  // 간단한 정규식으로 키-값 추출 시도
  const regex = new RegExp(`"${key}"\\s*:\\s*"([^"]*)"`, 'i');
  const match = partialJson.match(regex);
  
  if (match) {
    return match[1];
  }

  // 불완전한 문자열 값도 추출 시도
  const incompleteRegex = new RegExp(`"${key}"\\s*:\\s*"([^"]*$)`, 'i');
  const incompleteMatch = partialJson.match(incompleteRegex);
  
  if (incompleteMatch) {
    return incompleteMatch[1];
  }

  return null;
}

/**
 * 부분적인 JSON에서 content 필드를 안전하게 추출
 */
export function extractPartialContent(partialJson: string): string {
  if (!partialJson.trim()) return "";
  
  try {
    // 완전한 JSON 파싱 시도
    const parsed = JSON.parse(partialJson);
    return parsed.content || "";
  } catch {
    // 부분적인 JSON에서 content 추출 시도
    const content = extractPartialJsonStringValue(partialJson, "content");
    if (content !== null) {
      return content;
    }
    
    // 그도 안되면 전체 텍스트 반환
    return partialJson;
  }
}