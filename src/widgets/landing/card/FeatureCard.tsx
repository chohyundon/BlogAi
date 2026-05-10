import type { FEATURES } from "@/shared/config/Main";

export default function FeatureCard({
  Icon,
  title,
  description,
}: (typeof FEATURES)[number]) {
  return (
    <div className="p-8 rounded-2xl bg-navy-900/50 border border-navy-700 hover:border-amber-500/50 transition-all group">
      <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        <Icon className="size-6 text-amber-400" />
      </div>
      <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
