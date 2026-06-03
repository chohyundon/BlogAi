"use client";

import { useQuery } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { createClient } from "@/shared/api/supabase/client";
import type { DatabaseDocument } from "@/shared/types/database";

export const postQueryKey = (postId: string) => ["post", postId] as const;

export async function getPostWrite(postId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as DatabaseDocument;
}

export async function invalidatePost(queryClient: QueryClient, postId: string) {
  await queryClient.invalidateQueries({ queryKey: postQueryKey(postId) });
}

export function useQueryPost(postId: string | undefined) {
  return useQuery({
    queryKey: postQueryKey(postId ?? ""),
    queryFn: () => getPostWrite(postId!),
    enabled: Boolean(postId),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}
