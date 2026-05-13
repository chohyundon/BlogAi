/**
 * 스트리밍 중인 마크다운을 미리보기에 적합하게 안정화
 */

export function stabilizeMarkdownForPreview(content: string): string {
  if (!content) return "";
  
  let stabilized = content;
  
  // 불완전한 코드 블록 처리
  const codeBlockMatch = stabilized.match(/```[\w]*\n?([^`]*)$/);
  if (codeBlockMatch && !stabilized.endsWith('```')) {
    // 불완전한 코드 블록이 있다면 임시로 닫아줌
    stabilized += '\n```';
  }
  
  // 불완전한 인라인 코드 처리
  const inlineCodeMatches = stabilized.match(/`[^`]*$/);
  if (inlineCodeMatches && !stabilized.endsWith('`')) {
    stabilized += '`';
  }
  
  // 불완전한 리스트 아이템 처리
  const lines = stabilized.split('\n');
  const lastLine = lines[lines.length - 1];
  
  // 마지막 줄이 리스트 마커로만 끝나는 경우
  if (lastLine && /^[\s]*[-*+]\s*$/.test(lastLine)) {
    lines[lines.length - 1] = lastLine + '...';
    stabilized = lines.join('\n');
  }
  
  // 불완전한 헤딩 처리
  if (lastLine && /^#{1,6}\s*$/.test(lastLine)) {
    lines[lines.length - 1] = lastLine + '...';
    stabilized = lines.join('\n');
  }
  
  return stabilized;
}

/**
 * 스트리밍 중인 제목을 추출하고 안정화
 */
export function extractStableTitle(content: string): string {
  if (!content) return "";
  
  try {
    const parsed = JSON.parse(content);
    return parsed.title || "";
  } catch {
    // JSON 파싱 실패 시 부분적 추출 시도
    const titleMatch = content.match(/"title"\s*:\s*"([^"]*)/i);
    if (titleMatch) {
      return titleMatch[1];
    }
    
    // 마크다운 헤딩 추출 시도
    const headingMatch = content.match(/^#{1,6}\s*(.+)$/m);
    if (headingMatch) {
      return headingMatch[1].trim();
    }
    
    return "";
  }
}