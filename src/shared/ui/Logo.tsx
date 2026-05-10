import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-xl">
      <div className="flex items-center justify-center size-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/25 group-hover:shadow-amber-500/40 transition-shadow">
        <Sparkles className="size-6" strokeWidth={2.5} />
      </div>
      <span className="text-xl font-bold tracking-tight text-white">
        Blog<span className="text-amber-400">Ai</span>
      </span>
    </Link>
  );
}
