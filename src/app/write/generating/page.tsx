import GeneratingDraft from "@/features/article-write/ui/GeneratingDraft";
import { siteDescription, siteName } from "@/shared/config/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${siteName} - 글 생성 중`,
  description: siteDescription,
  robots: {
    index: false,
    follow: false,
  },
};

export default function WriteGeneratingPage() {
  return <GeneratingDraft />;
}
