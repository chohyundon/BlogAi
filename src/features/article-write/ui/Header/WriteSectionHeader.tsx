const stepBadge =
  "flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-white text-sm font-bold";

export default function WriteSectionHeader({
  step,
  title,
  tooltip,
}: {
  step: number;
  title: string;
  tooltip?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <div className={stepBadge}>{step}</div>
        <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em]">
          {title}
        </h2>
      </div>
      {tooltip && (
        <div className="group relative" title={tooltip}>
          <span className="material-symbols-outlined text-slate-400 cursor-help text-xl">
            help
          </span>
          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-72 p-3 bg-navy-800 text-white text-xs rounded shadow-lg z-10 leading-relaxed border border-navy-600">
            {tooltip}
          </div>
        </div>
      )}
    </div>
  );
}
