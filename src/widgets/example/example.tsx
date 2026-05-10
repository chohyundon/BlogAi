"use client";

import { useEffect, useState } from "react";

export default function ExampleComponent() {
  const [data, setData] = useState<{ text?: string; error?: string } | null>(
    null
  );

  useEffect(() => {
    fetch("/api/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "대답해 gpt." }),
    })
      .then((res) => res.json())
      .then(setData)
      .catch((e) => setData({ error: String(e) }));
  }, []);

  if (data?.error) return <div>에러: {data.error}</div>;
  if (!data) return <div>로딩 중...</div>;
  return <div>{data.text ?? JSON.stringify(data)}</div>;
}
