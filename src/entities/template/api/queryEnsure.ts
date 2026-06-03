"use client";

import { useQueryUserData } from "@/entities/user/api/queryUserData";
import {
  isAtStoredPostLimit,
  MAX_STORED_POSTS,
} from "@/entities/template/model/postLimit";

export const storedPostLimitMessage = () =>
  `최대 ${MAX_STORED_POSTS}개의 포스트만 저장할 수 있습니다. 기존 글을 정리한 뒤 다시 시도해 주세요.`;

/** 마이페이지·대시보드와 같은 userData 캐시로 저장 한도 판단 */
export function useStoredPostLimitCheck(userId: string | undefined) {
  const { data, isLoading, isFetching } = useQueryUserData(userId);
  const count = data?.length ?? 0;
  const isAtLimit = isAtStoredPostLimit(count);
  const isChecking = Boolean(userId) && (isLoading || isFetching);

  return {
    count,
    isChecking,
    isAtLimit,
    limitMessage: storedPostLimitMessage(),
    canSave: Boolean(userId) && !isChecking && !isAtLimit,
  };
}
