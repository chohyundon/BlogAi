import { createClient } from "@/shared/api/supabase/server";
import {
  isAtStoredPostLimit,
  MAX_STORED_POSTS,
} from "@/entities/template/model/postLimit";

export type GateStoredPostLimitForAiResult =
  | { ok: true }
  | { ok: false; status: 401 | 403 | 500; error: string };

/**
 * AI 글 생성 전에 세션 사용자 기준 저장 포스트 개수를 검사한다.
 * 미로그인·한도 초과 시 JSON 에러로 막는다.
 */
export async function gateStoredPostLimitForAi(): Promise<GateStoredPostLimitForAiResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      ok: false,
      status: 401,
      error: "인증이 필요합니다. 다시 로그인해 주세요.",
    };
  }

  const { count, error } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (error) {
    console.error(error);
    return {
      ok: false,
      status: 500,
      error: "저장된 포스트 개수를 확인하지 못했습니다.",
    };
  }

  if (isAtStoredPostLimit(count ?? 0)) {
    return {
      ok: false,
      status: 403,
      error: `최대 ${MAX_STORED_POSTS}개의 포스트만 저장할 수 있습니다. 기존 글을 정리한 뒤 다시 시도해 주세요.`,
    };
  }

  return { ok: true };
}
