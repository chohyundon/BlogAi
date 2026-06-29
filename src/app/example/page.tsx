import Template from "@/widgets/template-showcase/ui/Template";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BlogAi - 템플릿 예시",
  description: "AI로 더 스마트하게, 개발자용 기술 블로그 작성",
  alternates: {
    canonical: "/example",
  },
  openGraph: {
    title: "BlogAi - 템플릿 예시",
    description: "AI로 더 스마트하게, 개발자용 기술 블로그 작성",
    url: "/example",
  },
};

export default function page() {
  return <Template />;
}
