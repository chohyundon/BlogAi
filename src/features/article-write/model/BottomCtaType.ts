import type { ArticleStreamDelta } from "@/entities/article/api/postArticleStream";
import type { GeneratedArticle } from "@/entities/article/model/generatedArticle";

export type { GeneratedArticle };

export type BottomCtaProps = {
  selectedTemplate: string;
  blogTitleValue: string;
  blogDescriptionValue: string;
  keywords: string[];
  setIsLoading: (loading: boolean) => void;
  setGeneratedArticle: (article: GeneratedArticle) => void;
  onStreamDelta?: (preview: ArticleStreamDelta) => void;
  onStreamBegin?: () => void;
  onStreamComplete?: () => void;
};
