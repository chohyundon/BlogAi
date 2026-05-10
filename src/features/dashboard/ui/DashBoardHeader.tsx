"use client";

import Button from "@/shared/ui/Button";
import { useAuthStore } from "@/features/auth/model/AuthStore";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";

export default function DashBoardHeader() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const handleWrite = () => {
    if (user) {
      router.push("/write");
    } else {
      return toast.error("로그인 후 이용해주세요.");
    }
  };

  return (
    <header className="flex flex-wrap justify-between items-end gap-6 mb-12">
      <div className="flex flex-col gap-2">
        <h2 className="text-white text-4xl font-black">
          어서오세요, {`${user?.user_metadata?.full_name} 님`}
        </h2>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="dark"
      />
      <Button
        className="font-bold shadow-lg bg-amber-500 hover:bg-amber-600 transition-all text-white"
        onClick={handleWrite}>
        새로운 글 작성
      </Button>
    </header>
  );
}
