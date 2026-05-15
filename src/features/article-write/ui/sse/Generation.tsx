"use client";

import { useState, useEffect } from "react";

export default function Generation() {
  const [data, setData] = useState<string>("");

  useEffect(() => {
    const sse = new EventSource(
      `/api/gemini?topic=${encodeURIComponent("블로그 초안 써줘")}`
    );

    sse.onmessage = (event) => {
      if (event.data === "[DONE]") return sse.close();
      console.log("Generation: ", event.data);
      setData((prev) => prev + event.data);
    };

    sse.onerror = () => {
      sse.close();
    };

    // 컴포넌트 언마운트 시 연결 정리
    return () => sse.close();
  }, []); // [] = 마운트 시 한 번만 실행

  return <div>{data}</div>;
}
