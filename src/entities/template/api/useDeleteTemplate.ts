"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTemplate } from "@/entities/template/api/deleteTemplate";
import {
  invalidateUserData,
  userDataQueryKey,
} from "@/entities/user/api/queryUserData";
import type { DatabaseDocument } from "@/shared/types/database";

export function useDeleteTemplate(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await deleteTemplate(postId);
      if (error) {
        throw new Error(error);
      }
      return postId;
    },
    onSuccess: async (postId) => {
      if (!userId) {
        return;
      }

      queryClient.setQueryData<DatabaseDocument[] | null>(
        userDataQueryKey(userId),
        (old) => old?.filter((post) => String(post.id) !== String(postId))
      );
      await invalidateUserData(queryClient, userId);
    },
  });
}
