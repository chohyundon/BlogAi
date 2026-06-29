import GeneratingDraft from "@/features/article-write/ui/GeneratingDraft";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BlogAi - 글 생성 중",
  description: "AI로 더 스마트하게, 개발자용 기술 블로그 작성",
  robots: {
    index: false,
    follow: false,
  },
};

export default function WriteGeneratingPage() {
  return <GeneratingDraft />;
}
