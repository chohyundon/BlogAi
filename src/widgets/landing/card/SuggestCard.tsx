export default function SuggestCard() {
  return (
    <div className="absolute -bottom-6 -right-6 p-4 rounded-xl border border-amber-500/30 bg-navy-900/95 backdrop-blur shadow-2xl max-w-[240px] text-left transform rotate-2 hover:rotate-0 transition-transform">
      <div className="flex items-center gap-2 mb-2">
        <span className="material-symbols-outlined text-amber-400 text-sm">
          bolt
        </span>
        <span className="text-xs font-bold text-slate-200">AI Suggestion</span>
      </div>
      <p className="text-[11px] text-slate-400 leading-tight">
        &quot;이 부분에 대한 시퀀스 다이어그램 설명을 추가하면 독자가 더 쉽게
        이해할 수 있습니다. 생성하시겠습니까?&quot;
      </p>
      <button
        type="button"
        className="mt-3 w-full bg-amber-500 text-[10px] font-bold py-1.5 rounded text-white hover:bg-amber-400">
        Apply Change
      </button>
    </div>
  );
}
