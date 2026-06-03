"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserData } from "./getUserData";

export function useQueryUserData(userId: string | undefined) {
  return useQuery({
    queryKey: ["userData", userId],
    queryFn: () => getUserData(userId!),
    enabled: Boolean(userId),
  });
}
