const BADGE_BY_TYPE: Record<string, string> = {
  TIL: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Tutorial: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Trouble_Shooting: "bg-amber-500/10 text-amber-300 border-amber-500/25",
};

const BADGE_DEFAULT = "bg-navy-700/80 text-slate-400 border-navy-600";

export default function TemplateTypeBadge({
  templateType,
}: {
  templateType: string;
}) {
  const classes = BADGE_BY_TYPE[templateType] ?? BADGE_DEFAULT;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${classes}`}>
      {templateType}
    </span>
  );
}
