"use client";

import { GeneratedArticle } from "@/entities/article/model/generatedArticle";

export default function Generation(generatedArticle: GeneratedArticle) {
  const sse = new EventSource("/api/gemini");

  sse.onmessage = (event) => {
    console.log(event.data);
  };

  return <div>Generation</div>;
}
