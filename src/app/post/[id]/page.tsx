import PostScreen from "@/features/post-view/ui/PostScreen";
import { createClient } from "@/shared/api/supabase/server";
import { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

const defaultDescription = "AI로 더 스마트하게, 개발자용 기술 블로그 작성";
const ogImage = "/opengraph-image";

function toDescription(content: string | null | undefined) {
  if (!content) return defaultDescription;

  const plainText = content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#>*_`~\-[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return plainText.slice(0, 155) || defaultDescription;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const fallbackTitle = `BlogAi - ${id} 블로그 포스트`;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("posts")
      .select("title, content, keywords, template_type, created_at")
      .eq("id", id)
      .single();

    if (!data) {
      return {
        title: fallbackTitle,
        description: defaultDescription,
      };
    }

    const title = data.title || fallbackTitle;
    const description = toDescription(data.content);

    return {
      title,
      description,
      keywords: data.keywords ?? undefined,
      alternates: {
        canonical: `/post/${id}`,
      },
      openGraph: {
        type: "article",
        title,
        description,
        url: `/post/${id}`,
        publishedTime: data.created_at,
        tags: data.keywords ?? undefined,
        section: data.template_type,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImage],
      },
    };
  } catch {
    return {
      title: fallbackTitle,
      description: defaultDescription,
    };
  }
}

export default async function PostByIdPage({ params }: Props) {
  const { id } = await params;
  return <PostScreen postId={id} />;
}
