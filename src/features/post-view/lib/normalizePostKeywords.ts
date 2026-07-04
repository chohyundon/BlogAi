export function normalizePostKeywords(value: unknown): string[] | null {
  if (value == null) return null;

  if (Array.isArray(value)) {
    return value.map(String);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map(String);
      }
    } catch {
      // fall through to comma-separated parsing
    }

    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return null;
}
