"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/features/auth/model/AuthStore";
import Footer from "@/shared/ui/Footer";
import AuthModal from "@/features/auth/ui/AuthModal";
import HomeTitleSection from "@/widgets/landing/title/HomeTitleSection";
import BottomCta from "@/widgets/landing/bottom/BottomCta";
import FeatureSection from "@/widgets/landing/feature/FeatureSection";

export default function Home() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [isOpenModal, setIsOpenModal] = useState(false);

  const startOrOpenAuth = () => {
    if (user) router.push("/dashboard");
    else setIsOpenModal(true);
  };

  return (
    <div className="relative min-h-screen w-full h-full bg-navy-950">
      {isOpenModal && <AuthModal setOpenModal={setIsOpenModal} />}
      <HomeTitleSection onStartFree={startOrOpenAuth} />
      <FeatureSection />
      <BottomCta onStartFree={startOrOpenAuth} />
      <Footer />
    </div>
  );
}
