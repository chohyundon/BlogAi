"use client";

import { X } from "lucide-react";
import { useRef } from "react";
import { SocialLogin } from "@/features/auth/lib/SocialLogin";
import { SOCIAL_LOGIN } from "@/shared/config/Login";
import Image from "next/image";
import Button from "@/shared/ui/Button";

export default function AuthModal({
  setOpenModal,
  modalRef: modalRefProp,
  isHomePage: _isHomePage,
}: {
  setOpenModal: (open: boolean) => void;
  modalRef?: React.RefObject<HTMLDivElement | null>;
  isHomePage?: boolean;
}) {
  const fallbackRef = useRef<HTMLDivElement>(null);
  const modalRef = modalRefProp ?? fallbackRef;

  return (
    <div
      ref={modalRef}
      className="fixed left-1/2 top-1/2 z-101 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-navy-700 bg-navy-950 p-6 shadow-xl"
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 id="auth-modal-title" className="text-xl font-bold text-white">
            로그인
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            소셜 계정으로 간편히 시작하세요
          </p>
        </div>
        <Button
          onClick={() => setOpenModal(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
          aria-label="닫기">
          <X className="size-5" />
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        {SOCIAL_LOGIN.map((social) => (
          <Button
            key={social.name}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
              social.className ?? "bg-navy-600 text-white hover:opacity-90"
            }`}
            onClick={() => {
              SocialLogin(social.name);
            }}>
            <Image
              src={social.icon}
              alt={social.name}
              width={20}
              height={20}
              className="size-5 shrink-0"
            />
            {`${social.name}로 로그인하기`}
          </Button>
        ))}
        <p className="text-xs text-slate-500 text-center mt-4">
          로그인 시 이용약관 및 개인정보처리방침에 동의하게 됩니다.
        </p>
      </div>
    </div>
  );
}
