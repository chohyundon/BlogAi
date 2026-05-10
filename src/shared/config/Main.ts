import { Braces, CopyPlus, SquareDashedBottomCode } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Feature = {
  Icon: LucideIcon;
  title: string;
  description: string;
};

export const FEATURES: Feature[] = [
  {
    Icon: Braces,
    title: "AI Generation",
    description:
      "코드 스니펫이나 키워드 몇 개만으로도 기술적으로 정확하고 깊이 있는 초안을 즉시 생성합니다.",
  },
  {
    Icon: SquareDashedBottomCode,
    title: "Markdown Editor",
    description:
      "실시간 미리보기와 개발자 친화적인 구문 강조(Syntax Highlighting)를 지원하는 전문 편집기입니다.",
  },
  {
    Icon: CopyPlus,
    title: "Multiple Templates",
    description:
      "튜토리얼, 릴리즈 노트, 아키텍처 리뷰 등 상황에 맞는 최적의 기술 블로그 레이아웃을 제공합니다.",
  },
];
