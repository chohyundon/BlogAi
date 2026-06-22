"use client";

import AuthModal from "@/features/auth/ui/AuthModal";
import { useAuthStore } from "@/features/auth/model/AuthStore";
import HomeTitleSection from "@/widgets/landing/title/HomeTitleSection";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomeModal() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [isOpenModal, setIsOpenModal] = useState(false);

  const startOrOpenAuth = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      setIsOpenModal(true);
    }
  };

  return (
    <>
      {isOpenModal && <AuthModal setOpenModal={setIsOpenModal} />}
      <HomeTitleSection onStartFree={startOrOpenAuth} />
    </>
  );
}
