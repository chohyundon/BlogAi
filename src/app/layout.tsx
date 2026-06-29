import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/app/globals.css";
import { Providers } from "@/app/providers";
import AppShell from "@/widgets/app-shell/ui/AppShell";

const pretendard = localFont({
  src: "../../public/fonts/PretendardVariable.woff2",
  display: "swap",
  variable: "--font-pretendard",
});

const siteUrl = "https://www.blogai.store";
const siteName = "BlogAi";
const siteDescription = "AI로 더 스마트하게, 개발자용 기술 블로그 작성";
const ogImage = "/opengraph-image";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: ["AI 블로그", "기술 블로그", "개발자 블로그", "블로그 글쓰기"],
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
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
