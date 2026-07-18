"use client";

import { useEffect } from "react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" data-testid="global-error-page">
      <h2>문제가 발생했습니다</h2>
      <p>{error.message}</p>
      <button onClick={reset} data-testid="global-error-reset">
        다시 시도
      </button>
    </div>
  );
}
