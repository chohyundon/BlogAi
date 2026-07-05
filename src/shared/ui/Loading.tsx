type LoadingComponentProps = {
  label?: string;
  fullWidth?: boolean;
};

export default function LoadingComponent({
  label = "로딩 중",
  fullWidth = false,
}: LoadingComponentProps) {
  return (
    <div
      className={`flex flex-col items-center gap-5 ${fullWidth ? "w-full" : ""}`}
      role="status"
      aria-live="polite"
      aria-label={label}>
      <div className="relative h-20 w-20">
        <div
          className="absolute inset-0 rounded-full border-[5px] border-navy-600"
          aria-hidden
        />
        <div
          className="absolute inset-0 rounded-full border-[5px] border-transparent border-t-amber-300 border-r-amber-400 animate-spin shadow-[0_0_24px_rgba(251,191,36,0.35)]"
          aria-hidden
        />
      </div>
      <div
        className={`h-2 overflow-hidden rounded-full bg-navy-700 ring-1 ring-navy-500/80 ${
          fullWidth ? "w-full" : "w-56"
        }`}
        aria-hidden>
        <div className="loading-bar-indeterminate h-full w-2/5 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500" />
      </div>
    </div>
  );
}
