import DashBoardWrite from "@/features/article-write/ui/DashBoard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BlogAi - 글 작성",
  description: "AI로 더 스마트하게, 개발자용 기술 블로그 작성",
  robots: {
    index: false,
    follow: false,
  },
};

export default function WritePage() {
  return <DashBoardWrite />;
}
