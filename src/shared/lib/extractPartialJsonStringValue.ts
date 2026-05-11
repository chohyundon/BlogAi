/**
 * 스트리밍 중인 JSON 문자열에서 특정 키의 문자열 값을 부분적으로 추출한다.
 * value가 아직 닫히지 않았으면 지금까지의 이스케이프 해제된 접두만 반환한다.
 */
export function extractPartialJsonStringValue(
  json: string,
  key: string
): string | undefined {
  const needle = `"${key}"`;
  const keyIdx = json.indexOf(needle);
  if (keyIdx === -1) return undefined;

  let rest = json.slice(keyIdx + needle.length).trimStart();
  if (!rest.startsWith(":")) return undefined;
  rest = rest.slice(1).trimStart();
  if (!rest.startsWith('"')) return undefined;

  let i = 1;
  let out = "";
  let escape = false;
  while (i < rest.length) {
    const c = rest[i];
    if (escape) {
      if (c === "n") out += "\n";
      else if (c === "t") out += "\t";
      else if (c === "r") out += "\r";
      else if (c === '"') out += '"';
      else if (c === "\\") out += "\\";
      else if (c === "/") out += "/";
      else if (c === "u" && rest.length >= i + 5) {
        const hex = rest.slice(i + 1, i + 5);
        if (/^[0-9a-fA-F]{4}$/.test(hex)) {
          out += String.fromCharCode(Number.parseInt(hex, 16));
          i += 4;
        } else out += "u";
      } else out += c;
      escape = false;
    } else if (c === "\\") {
      escape = true;
    } else if (c === '"') {
      return out;
    } else {
      out += c;
    }
    i += 1;
  }
  return out;
}
