import { FEATURES } from "@/shared/config/Main";
import FeatureCard from "@/widgets/landing/card/FeatureCard";

export default function FeatureSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-32 border-t border-navy-700">
      <div className="text-center mb-20">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-white">
          키워드로 시작하고, <br className="md:hidden" />
          마크다운으로 다듬으세요
        </h2>
        <p className="text-slate-400">
          AI 초안·실시간 미리보기·상황별 템플릿까지—기술 글 한 편을 만드는
          단계를 한 화면에 모았습니다.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  );
}
