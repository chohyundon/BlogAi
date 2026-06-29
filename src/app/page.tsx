import Home from "@/widgets/landing/Home";
import { ogImage, siteDescription, siteName, siteUrl } from "@/shared/config/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${siteName} — AI 기술 블로그 작성`,
  description: siteDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${siteName} — AI 기술 블로그 작성`,
    description: siteDescription,
    url: siteUrl,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: siteDescription,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — AI 기술 블로그 작성`,
    description: siteDescription,
    images: [ogImage],
  },
};

export default function page() {
  return <Home />;
}
