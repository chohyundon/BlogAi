import Template from "@/widgets/template-showcase/ui/Template";
import { siteDescription, siteName } from "@/shared/config/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${siteName} - 템플릿 예시`,
  description: siteDescription,
  alternates: {
    canonical: "/example",
  },
  openGraph: {
    title: `${siteName} - 템플릿 예시`,
    description: siteDescription,
    url: "/example",
  },
};

export default function page() {
  return <Template />;
}
