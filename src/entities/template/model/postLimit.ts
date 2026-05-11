/** Supabase `posts`에 저장할 수 있는 최대 개수 (기존 글 개수 기준) */
export const MAX_STORED_POSTS = 10;

export function isAtStoredPostLimit(currentCount: number): boolean {
  return currentCount >= MAX_STORED_POSTS;
}

const defaultLimitMessage = () =>
  `최대 ${MAX_STORED_POSTS}개의 포스트만 저장할 수 있습니다. 기존 글을 정리한 뒤 다시 시도해 주세요.`;

/** 클라이언트에서 한도 초과 시 던져 `postArticleStream` 등 호출부에서 구분할 때 사용 */
export class StoredPostLimitError extends Error {
  readonly code = "STORED_POST_LIMIT" as const;
  constructor(message: string = defaultLimitMessage()) {
    super(message);
    this.name = "StoredPostLimitError";
  }
}
