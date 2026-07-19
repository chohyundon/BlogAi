import Home from "@/widgets/landing/Home";
import {
  ogImage,
  siteDescription,
  siteName,
  siteUrl,
} from "@/shared/config/site";
import type { Metadata } from "next";

const pageTitle = `${siteName} — 개발자를 위한 AI 기술 블로그 자동 생성`;

export const metadata: Metadata = {
  title: pageTitle,
  description: siteDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: pageTitle,
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
    title: pageTitle,
    description: siteDescription,
    images: [ogImage],
  },
};

export default function page() {
  return <Home />;
}
