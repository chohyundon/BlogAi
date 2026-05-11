/** Supabase `posts`에 저장할 수 있는 최대 개수 (기존 글 개수 기준) */
export const MAX_STORED_POSTS = 10;

export function isAtStoredPostLimit(currentCount: number): boolean {
  return currentCount >= MAX_STORED_POSTS;
}
