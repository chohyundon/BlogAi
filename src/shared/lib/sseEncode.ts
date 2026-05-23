/** SSE data 필드용 멀티라인 인코딩 */
export function encodeSseEvent(data: string, event?: string): Uint8Array {
  const encoder = new TextEncoder();
  const dataLines = data.split("\n").map((line) => `data: ${line}`);
  const eventLine = event ? `event: ${event}\n` : "";
  return encoder.encode(`${eventLine}${dataLines.join("\n")}\n\n`);
}
