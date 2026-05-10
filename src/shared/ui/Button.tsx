"use client";

import { useRouter } from "next/navigation";

export default function Button({
  children,
  isDashboard,
  onClick,
  className,
  isDisabled,
}: {
  children: React.ReactNode;
  isDashboard?: boolean;
  onClick?: () => void;
  className?: string;
  isDisabled?: boolean;
}) {
  const router = useRouter();

  const handleClick = () => {
    if (isDashboard) {
      router.push("/write");
    } else {
      onClick?.();
    }
  };

  return (
    <button
      className={`cursor-pointer px-4 py-2 font-semibold rounded-lg hover:opacity-80 transition-colors duration-300 ${className}`}
      onClick={handleClick}
      disabled={isDisabled}>
      {children}
    </button>
  );
}
