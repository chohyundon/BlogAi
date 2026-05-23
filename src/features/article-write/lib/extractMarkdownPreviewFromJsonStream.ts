function unescapeJsonString(value: string): string {
  return value
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}

/** JSON 스트림 버퍼에서 content 필드 미리보기 추출 */
export function extractMarkdownPreviewFromJsonStream(raw: string): string {
  const match = raw.match(/"content"\s*:\s*"((?:[^"\\]|\\.)*)/);
  if (!match?.[1]) return "";
  return unescapeJsonString(match[1]);
}
