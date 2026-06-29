import Mypage from "@/features/mypage/ui/mypage";
import { siteDescription, siteName } from "@/shared/config/site";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `${siteName} - 내 블로그 글 목록`,
  description: siteDescription,
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: `${siteName} - 내 블로그 글 목록`,
    description: siteDescription,
  },
};

export default function page() {
  return <Mypage />;
}
