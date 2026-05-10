import { ArrowRight, Bot, Sparkle, Play } from "lucide-react";
import ProductMockup from "../product/ProductMock";

type HomeTitleSectionProps = {
  onStartFree: () => void;
};

export default function HomeTitleSection({
  onStartFree,
}: HomeTitleSectionProps) {
  return (
    <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-8">
        <Bot className="size-4" />
        GPT-4o 기반 기술 블로그 작성 지원
      </div>
      <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 max-w-4xl leading-[1.1] text-white">
        개발자의 글쓰기, <br />
        <span className="inline-flex items-center justify-center gap-1 text-amber-400">
          <Sparkle className="size-4 shrink-0" /> AI로 더 스마트하게
        </span>
      </h1>
      <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-12 leading-relaxed">
        복잡한 기술 블로그 작성, 이제 AI와 개발자 전용 템플릿으로{" "}
        <br className="hidden md:block" /> 10분 만에 완성하세요. 코드는 그대로,
        설명은 완벽하게.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 mb-24 w-full justify-center">
        <button
          type="button"
          onClick={onStartFree}
          className="cursor-pointer bg-amber-500 hover:bg-amber-400 text-white text-lg font-bold px-10 py-4 rounded-xl transition-all shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2">
          Start for Free <ArrowRight className="size-4" />
        </button>
        <span className="bg-navy-800 border border-navy-600 text-slate-200 text-lg font-bold px-10 py-4 rounded-xl hover:bg-navy-700 transition-all flex items-center justify-center gap-2">
          <Play className="size-4" /> View Demo
        </span>
      </div>
      <ProductMockup />
    </main>
  );
}
