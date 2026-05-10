import { Info } from "lucide-react";

export default function WriteInfoToolTip({ text }: { text: string }) {
  return (
    <div className="group relative inline-flex">
      <Info className="size-4 text-slate-400 cursor-help hover:text-white transition-colors" />
      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-64 p-2 bg-navy-800 border border-navy-600 text-white text-[11px] rounded shadow-lg z-20">
        {text}
      </div>
    </div>
  );
}
