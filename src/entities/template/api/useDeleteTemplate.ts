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
    onMutate: async (postId) => {
      if (!userId)
        return { previous: undefined as DatabaseDocument[] | undefined };

      await queryClient.cancelQueries({ queryKey: userDataQueryKey(userId) });
      const previous = queryClient.getQueryData<DatabaseDocument[]>(
        userDataQueryKey(userId)
      );
      queryClient.setQueryData<DatabaseDocument[]>(
        userDataQueryKey(userId),
        (old) => (old ?? []).filter((t) => String(t.id) !== String(postId))
      );
      return { previous };
    },
    onError: (_error, _postId, context) => {
      if (userId && context?.previous !== undefined) {
        queryClient.setQueryData(userDataQueryKey(userId), context.previous);
      }
    },
    onSettled: () => {
      if (userId) {
        void invalidateUserData(queryClient, userId);
      }
    },
  });
}
