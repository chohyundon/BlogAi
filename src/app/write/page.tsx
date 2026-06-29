import DashBoardWrite from "@/features/article-write/ui/DashBoard";
import { siteDescription, siteName } from "@/shared/config/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${siteName} - 글 작성`,
  description: siteDescription,
  robots: {
    index: false,
    follow: false,
  },
};

export default function WritePage() {
  return <DashBoardWrite />;
}
