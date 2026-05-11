/** 스트리밍 중 닫히지 않은 코드 펜스가 ReactMarkdown을 깨지 않도록 임시로 닫는다. */
export function stabilizeMarkdownForPreview(md: string): string {
  const fences = (md.match(/```/g) ?? []).length;
  if (fences % 2 === 1) {
    return `${md}\n\n\`\`\``;
  }
  return md;
}
