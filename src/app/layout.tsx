import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/app/globals.css";
import { Providers } from "@/app/providers";
import {
  ogImage,
  siteDescription,
  siteName,
  siteUrl,
  websiteJsonLd,
} from "@/shared/config/site";
import AppShell from "@/widgets/app-shell/ui/AppShell";

const pretendard = localFont({
  src: [
    {
      path: "../../public/fonts/woff2-subset/Pretendard-Regular.subset.woff2",
      weight: "400",
    },
    {
      path: "../../public/fonts/woff2-subset/Pretendard-Medium.subset.woff2",
      weight: "500",
    },
    {
      path: "../../public/fonts/woff2-subset/Pretendard-SemiBold.subset.woff2",
      weight: "600",
    },
    {
      path: "../../public/fonts/woff2-subset/Pretendard-Bold.subset.woff2",
      weight: "700",
    },
  ],
  display: "swap",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    "BlogAi",
    "BlogAI",
    "blogai.store",
    "AI 블로그",
    "기술 블로그",
    "개발자 블로그",
    "블로그 글쓰기",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    locale: "ko_KR",
    title: siteName,
    description: siteDescription,
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
    title: siteName,
    description: siteDescription,
    images: [ogImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${pretendard.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
