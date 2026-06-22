"use client";

import AuthModal from "@/features/auth/ui/AuthModal";
import { useAuthStore } from "@/features/auth/model/AuthStore";
import Button from "@/shared/ui/Button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BottomCta() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [isOpenModal, setIsOpenModal] = useState(false);

  const onStartFree = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      setIsOpenModal(true);
    }
  };

  return (
    <section className="max-w-5xl mx-auto px-6 pb-32">
      {isOpenModal && <AuthModal setOpenModal={setIsOpenModal} />}
      <div className="relative rounded-3xl p-12 overflow-hidden text-center bg-amber-500 flex flex-col items-center">
        <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
        <h2 className="text-3xl md:text-5xl font-black text-white mb-6 relative z-10">
          지금 바로 첫 글을 작성해보세요
        </h2>
        <p className="text-white/90 mb-10 text-lg relative z-10">
          수백 명의 개발자가 이미 TechWrite AI와 함께 성장하고 있습니다.
        </p>
        <Button
          onClick={onStartFree}
          className="cursor-pointer text-black bg-white text-lg font-bold px-12 py-4 rounded-xl shadow-2xl hover:bg-white/80 transition-all relative z-10">
          Get Started Free
        </Button>
      </div>
    </section>
  );
}
