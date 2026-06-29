import Mypage from "@/features/mypage/ui/mypage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "BlogAi - 내 블로그 글 목록",
  description: "AI로 더 스마트하게, 개발자용 기술 블로그 작성",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "BlogAi - 내 블로그 글 목록",
    description: "AI로 더 스마트하게, 개발자용 기술 블로그 작성",
  },
};

export default function page() {
  return <Mypage />;
}
