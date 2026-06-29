import PostScreen from "@/features/post-view/ui/PostScreen";
import { getPostForSeo } from "@/features/post-view/lib/getPostForSeo";
import { ogImage, siteDescription, siteName, siteUrl } from "@/shared/config/site";
import { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

function toDescription(content: string | null | undefined) {
  if (!content) return siteDescription;

  const plainText = content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#>*_`~\-[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return plainText.slice(0, 155) || siteDescription;
}

function buildBlogPostingJsonLd(
  id: string,
  post: NonNullable<Awaited<ReturnType<typeof getPostForSeo>>>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: toDescription(post.content),
    datePublished: post.created_at,
    dateModified: post.created_at,
    author: {
      "@type": "Organization",
      name: siteName,
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}${ogImage}`,
      },
    },
    mainEntityOfPage: `${siteUrl}/post/${id}`,
    keywords: post.keywords?.join(", "),
    articleSection: post.template_type,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const fallbackTitle = `${siteName} - ${id} 블로그 포스트`;
  const post = await getPostForSeo(id);

  if (!post) {
    return {
      title: fallbackTitle,
      description: siteDescription,
    };
  }

  const title = post.title || fallbackTitle;
  const description = toDescription(post.content);

  return {
    title,
    description,
    keywords: post.keywords ?? undefined,
    alternates: {
      canonical: `/post/${id}`,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/post/${id}`,
      publishedTime: post.created_at,
      tags: post.keywords ?? undefined,
      section: post.template_type,
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
}

export default async function PostByIdPage({ params }: Props) {
  const { id } = await params;
  const post = await getPostForSeo(id);

  return (
    <>
      {post ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildBlogPostingJsonLd(id, post)),
          }}
        />
      ) : null}
      <PostScreen postId={id} />
    </>
  );
}
