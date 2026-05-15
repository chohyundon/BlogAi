"use client";

import { useState, useEffect } from "react";

export default function Generation() {
  const [data, setData] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [status, setStatus] = useState<string>("연결 시도 중...");

  useEffect(() => {
    console.log("SSE 연결 시작");
    const sse = new EventSource(
      `/api/gemini?topic=${encodeURIComponent("블로그 초안 써줘")}`
    );

    sse.onopen = () => {
      console.log("SSE 연결 성공");
      setStatus("연결됨");
      setError("");
    };

    sse.onmessage = (event) => {
      console.log("SSE 메시지:", event.data);

      if (event.data === "[DONE]") {
        console.log("SSE 스트림 완료");
        setStatus("완료");
        return sse.close();
      }

      setData((prev) => prev + event.data);
    };

    sse.onerror = (event) => {
      console.error("SSE 에러:", event);
      setError("연결 오류 발생");
      setStatus("에러");
      sse.close();
    };

    // 컴포넌트 언마운트 시 연결 정리
    return () => {
      console.log("SSE 연결 정리");
      sse.close();
    };
  }, []); // [] = 마운트 시 한 번만 실행

  return (
    <div className="p-4 bg-slate-800 text-white rounded-lg">
      <div className="mb-2">
        <strong>상태:</strong> {status}
      </div>
      {error && (
        <div className="mb-2 text-red-400">
          <strong>에러:</strong> {error}
        </div>
      )}
      <div className="whitespace-pre-wrap">{data || "데이터 대기 중..."}</div>
    </div>
  );
}
