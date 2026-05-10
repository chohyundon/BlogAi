export const NAVY = {
  bg: "bg-navy-950",
  card: "bg-navy-900",
  cardBorder: "border-navy-700",
  input: "bg-navy-800/50 border-navy-600 text-white placeholder:text-slate-500",
} as const;

const inputBase =
  "w-full rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 outline-none transition-all " +
  NAVY.input;
const sectionCard =
  "p-6 rounded-xl border shadow-lg " + NAVY.card + " " + NAVY.cardBorder;
const templateCardBase =
  "group cursor-pointer border-2 p-4 rounded-xl transition-all";
const keywordTag =
  "flex items-center gap-1 bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-sm font-medium border border-amber-500/30";
const suggestionBtn =
  "text-xs font-medium px-2 py-1 bg-slate-700/80 text-slate-300 rounded hover:bg-slate-600 transition-colors";

export const dashboardWriteStyles = {
  inputBase,
  sectionCard,
  templateCardBase,
  keywordTag,
  suggestionBtn,
} as const;
