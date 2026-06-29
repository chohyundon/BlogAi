import TemplateId from "@/widgets/template-showcase/ui/TemplateId";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ id?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const templateId = id ?? "TIL";

  return {
    title: `BlogAi - ${templateId} 템플릿 예시`,
    description: "AI로 더 스마트하게, 개발자용 기술 블로그 작성",
    alternates: {
      canonical: `/example/${templateId}`,
    },
    openGraph: {
      title: `BlogAi - ${templateId} 템플릿 예시`,
      description: "AI로 더 스마트하게, 개발자용 기술 블로그 작성",
      url: `/example/${templateId}`,
    },
  };
}

export default function ExampleByIdPage() {
  return <TemplateId />;
}
