"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTemplate } from "@/entities/template/api/deleteTemplate";
import { invalidateUserData } from "@/entities/user/api/queryUserData";

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
    onSuccess: () => {
      if (userId) {
        invalidateUserData(queryClient, userId);
      }
    },
  });
}
