import { BookOpen, Search, Wrench } from "lucide-react";

export const TEMPLATES = [
  {
    id: "TIL",
    name: "오늘 배운 것 (TIL)",
    description: "간결한 기술적 발견과 빠른 팁을 정리합니다.",
    icon: BookOpen,
  },
  {
    id: "Trouble_Shooting",
    name: "트러블슈팅",
    description: "특정 버그나 문제 해결 과정에 대한 상세 가이드.",
    icon: Wrench,
  },
  {
    id: "Deep_Dive",
    name: "딥다이브",
    description: "아키텍처 패턴이나 기술 스택의 깊이 있는 분석.",
    icon: Search,
  },
] as const;

export const TEMPLATE_IMAGES: Record<string, string> = {
  TIL: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=340&fit=crop",
  Deep_Dive:
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=340&fit=crop",
  Trouble_Shooting:
    "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&h=340&fit=crop",
};

export const TEMPLATES_PER_PAGE = 6;
