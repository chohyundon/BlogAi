"use client";

import { createClient } from "@/shared/api/supabase/client";
import { useEffect, useRef } from "react";

export default function HeaderModal({
  setModalOpen,
}: {
  setModalOpen: (open: boolean) => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setModalOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      onClick={handleLogout}
      ref={modalRef as React.RefObject<HTMLDivElement>}
      className="px-6 py-4 cursor-pointer bg-navy-800 border z-50 border-navy-600 absolute top-18 right-6 rounded-lg shadow-lg hover:bg-navy-700 transition-colors">
      <h2 className="text-sm font-medium text-slate-200">로그아웃</h2>
    </div>
  );
}
