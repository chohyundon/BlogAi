"use client";

import { useQueryPost } from "@/features/post-view/lib/postWrite";
import PostEditor from "@/features/post-view/ui/PostEditor";

type PostScreenProps = {
  postId?: string;
};

function PostScreenMessage({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "error";
}) {
  return (
    <main className="flex-1 flex flex-col max-w-[1600px] mx-auto w-full px-4 sm:px-6 bg-navy-950 min-h-full">
      <div className="flex items-center justify-center flex-1 py-24">
        <p
          className={
            tone === "error"
              ? "text-red-300 text-sm"
              : "text-white text-lg font-semibold"
          }>
          {children}
        </p>
      </div>
    </main>
  );
}

export default function PostScreen({ postId }: PostScreenProps) {
  const { data, isLoading, isError, error } = useQueryPost(postId);

  if (isLoading) {
    return <PostScreenMessage>로딩중...</PostScreenMessage>;
  }

  if (isError || !postId || !data) {
    return (
      <PostScreenMessage tone="error">
        {error instanceof Error
          ? error.message
          : "포스트를 불러오지 못했습니다."}
      </PostScreenMessage>
    );
  }

  return <PostEditor key={postId} postId={postId} post={data} />;
}
