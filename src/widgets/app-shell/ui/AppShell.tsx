"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Aside from "@/widgets/aside/ui/Aside";
import Header from "@/widgets/header/ui/Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isHomePage = pathname === "/";

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (isHomePage) {
    return (
      <div className="w-full h-screen flex flex-col">
        <Header />
        <div className="flex-1">{children}</div>
      </div>
    );
  }
  return (
    <div className="w-full h-screen bg-navy-950 flex flex-col overflow-hidden">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex-1 h-full flex w-full relative">
        <Aside open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
