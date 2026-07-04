type LoadingComponentProps = {
  label?: string;
};

export default function LoadingComponent({ label = "로딩 중" }: LoadingComponentProps) {
  return (
    <div
      className="flex flex-col items-center gap-5"
      role="status"
      aria-live="polite"
      aria-label={label}>
      <div className="relative h-16 w-16">
        <div
          className="absolute inset-0 rounded-full border-4 border-navy-700"
          aria-hidden
        />
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-300 border-r-amber-500 animate-spin"
          aria-hidden
        />
      </div>
      <div
        className="h-1.5 w-56 overflow-hidden rounded-full bg-navy-700/80 ring-1 ring-navy-600/60"
        aria-hidden>
        <div className="loading-bar-indeterminate h-full w-2/5 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500" />
      </div>
    </div>
  );
}
