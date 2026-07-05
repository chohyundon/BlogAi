"use client";

import LoadingComponent from "@/shared/ui/Loading";

type GeneratingDraftPhaseShellProps = {
  children: React.ReactNode;
};

export default function GeneratingDraftPhaseShell({
  children,
}: GeneratingDraftPhaseShellProps) {
  return (
    <div className="flex h-full min-h-0 w-full flex-1 items-center justify-center bg-navy-950 p-6 md:p-10">
      <div className="flex w-full max-w-lg flex-col items-center text-center">
        {children}
      </div>
    </div>
  );
}
