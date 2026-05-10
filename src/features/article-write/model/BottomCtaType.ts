export type GeneratedArticle = {
  title: string;
  content: string;
  keywords: string[];
  template: string;
};

export type BottomCtaProps = {
  selectedTemplate: string;
  blogTitleValue: string;
  blogDescriptionValue: string;
  keywords: string[];
  setIsLoading: (loading: boolean) => void;
  setGeneratedArticle: (article: GeneratedArticle) => void;
};
