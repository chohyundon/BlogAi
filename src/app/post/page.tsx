import PostScreen from "@/features/post-view/ui/PostScreen";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "BlogAi - 블로그 포스트",
  description: "AI로 더 스마트하게, 개발자용 기술 블로그 작성",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "BlogAi - 블로그 포스트",
    description: "AI로 더 스마트하게, 개발자용 기술 블로그 작성",
  },
};

export default function PostPage() {
  return <PostScreen />;
}
