import TemplateId from "@/widgets/template-showcase/ui/TemplateId";
import { TEMPLATES } from "@/entities/template/config/Template";
import { siteDescription, siteName } from "@/shared/config/site";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id?: string }>;
};

function isValidTemplateId(id: string) {
  return TEMPLATES.some((template) => template.id === id);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const templateId = id ?? "";

  if (!isValidTemplateId(templateId)) {
    return {
      title: `${siteName} - 템플릿 예시`,
      description: siteDescription,
    };
  }

  return {
    title: `${siteName} - ${templateId} 템플릿 예시`,
    description: siteDescription,
    alternates: {
      canonical: `/example/${templateId}`,
    },
    openGraph: {
      title: `${siteName} - ${templateId} 템플릿 예시`,
      description: siteDescription,
      url: `/example/${templateId}`,
    },
  };
}

export default async function ExampleByIdPage({ params }: Props) {
  const { id } = await params;

  if (!id || !isValidTemplateId(id)) {
    notFound();
  }

  return <TemplateId />;
}
