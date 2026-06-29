import DashBoard from "@/features/dashboard/ui/DashBoard";
import { siteDescription, siteName } from "@/shared/config/site";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `${siteName} - 대시보드`,
  description: siteDescription,
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: `${siteName} - 대시보드`,
    description: siteDescription,
  },
};

export default function DashBoardPage() {
  return <DashBoard />;
}
