import PostScreen from "@/features/post-view/ui/PostScreen";
import { siteDescription, siteName } from "@/shared/config/site";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `${siteName} - 블로그 포스트`,
  description: siteDescription,
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: `${siteName} - 블로그 포스트`,
    description: siteDescription,
  },
};

export default function PostPage() {
  return <PostScreen />;
}
