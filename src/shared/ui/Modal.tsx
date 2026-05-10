"use client";

export default function Modal({
  children,
  ref,
}: {
  children: React.ReactNode;
  ref: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div
      className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4"
      ref={ref}>
      <div className="bg-navy-900 border border-navy-700 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        {children}
      </div>
    </div>
  );
}
