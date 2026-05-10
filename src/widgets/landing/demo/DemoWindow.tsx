export function DemoWindowChrome() {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-navy-800/50 border-b border-navy-600">
      <div className="flex gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500/50" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
        <div className="w-3 h-3 rounded-full bg-green-500/50" />
      </div>
      <div className="text-xs font-mono text-slate-400">
        post_architecture_review.md
      </div>
      <div className="w-12" />
    </div>
  );
}

export default function DemoWindow() {
  return (
    <div className="relative w-full max-w-5xl group">
      <div className="absolute -inset-1 bg-linear-to-r from-amber-500/50 to-purple-500/50 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000" />
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-navy-600 bg-navy-900/80 backdrop-blur">
        <DemoWindowChrome />
      </div>
    </div>
  );
}

export function DemoEditorPane() {
  return (
    <div className="w-1/2 border-r border-white/5 p-6 text-left font-mono text-sm overflow-hidden">
      <p className="text-amber-400 mb-2"># Microservices Implementation</p>
      <p className="text-slate-400 mb-4">
        In this post, we explore the challenges of service discovery...
      </p>
      <div className="bg-black/40 rounded p-4 mb-4 border border-white/5">
        <p className="text-green-400">
          async function <span className="text-blue-400">fetchService</span>(){" "}
          {"{"}
        </p>
        <p className="text-green-400 pl-4">
          const res = await api.get(&apos;/info&apos;);
        </p>
        <p className="text-green-400">{"}"}</p>
      </div>
      <div className="flex items-center gap-2 text-amber-400 animate-pulse">
        <span className="material-symbols-outlined text-sm">edit</span>
        <span className="h-4 w-1 bg-amber-400" />
      </div>
    </div>
  );
}

export function DemoPreviewPane() {
  return (
    <div className="w-1/2 bg-black/20 p-6 text-left relative overflow-hidden">
      <div className="absolute top-4 right-4 bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-1 rounded border border-amber-500/30 uppercase tracking-widest">
        AI Preview
      </div>
      <h2 className="text-2xl font-bold mb-4 text-white">
        마이크로서비스 구현 전략
      </h2>
      <p className="text-slate-300 text-sm leading-relaxed mb-4">
        서비스 디스커버리는 분산 시스템의 핵심입니다. 위의 코드 스니펫에서 볼 수
        있듯이 비동기 통신을 통해 시스템의 유연성을 확보할 수 있습니다.
      </p>
      <div className="space-y-3">
        <div className="h-2 w-full bg-slate-700/50 rounded" />
        <div className="h-2 w-4/5 bg-slate-700/50 rounded" />
        <div className="h-2 w-5/6 bg-slate-700/50 rounded" />
      </div>
    </div>
  );
}
