"use client";

import { useQuery } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { getUserData } from "@/entities/user/api/getUserData";

export const userDataQueryKey = (userId: string) =>
  ["userData", userId] as const;

export async function invalidateUserData(
  queryClient: QueryClient,
  userId: string
) {
  await queryClient.invalidateQueries({ queryKey: userDataQueryKey(userId) });
}

export function useQueryUserData(userId: string | undefined) {
  return useQuery({
    queryKey: userDataQueryKey(userId ?? ""),
    queryFn: () => getUserData(userId!),
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}
