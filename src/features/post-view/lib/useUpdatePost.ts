"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePost } from "@/features/post-view/lib/postEdit";
import { invalidatePost } from "@/features/post-view/lib/postWrite";
import { invalidateUserData } from "@/entities/user/api/queryUserData";

export type UpdatePostVariables = {
  content: string;
  title: string;
};

export function useUpdatePost(
  postId: string | undefined,
  userId: string | undefined
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ content, title }: UpdatePostVariables) => {
      if (!postId) {
        throw new Error("포스트 ID가 없습니다.");
      }
      return updatePost(postId, content, title);
    },
    onSuccess: async () => {
      if (!postId) return;
      await Promise.all([
        invalidatePost(queryClient, postId),
        userId ? invalidateUserData(queryClient, userId) : Promise.resolve(),
      ]);
    },
  });
}
