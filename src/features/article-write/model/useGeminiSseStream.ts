"use client";

import { useEffect, useState } from "react";
import { buildGeminiSseUrl } from "@/features/article-write/lib/geminiSseUrl";

export type GeminiSseStatus = "연결 시도 중..." | "연결됨" | "완료" | "에러";

export function useGeminiSseStream(topic: string) {
  const [data, setData] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<GeminiSseStatus>("연결 시도 중...");

  useEffect(() => {
    if (!topic.trim()) {
      setError("주제 정보가 없습니다.");
      setStatus("에러");
      return;
    }

    const sse = new EventSource(buildGeminiSseUrl(topic));

    sse.onopen = () => {
      setStatus("연결됨");
      setError("");
    };

    sse.onmessage = (event) => {
      if (event.data === "[DONE]") {
        setStatus("완료");
        sse.close();
        return;
      }
      setData((prev) => prev + event.data);
    };

    sse.onerror = () => {
      setError("연결 오류 발생");
      setStatus("에러");
      sse.close();
    };

    return () => sse.close();
  }, [topic]);

  return { data, error, status };
}
