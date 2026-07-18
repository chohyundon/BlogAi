"use client";

import { useState } from "react";
import ErrorBoundary from "@/shared/ui/ErrorBoundary";

function BrokenComponent() {
  throw new Error("테스트용 컴포넌트 에러");
}

function StableComponent() {
  return <p data-testid="stable-content">정상 컴포넌트입니다</p>;
}

export default function ErrorBoundaryFixturePage() {
  const [shouldThrow, setShouldThrow] = useState(false);
  const [resetCount, setResetCount] = useState(0);

  return (
    <div>
      <button data-testid="trigger-error" onClick={() => setShouldThrow(true)}>
        에러 발생
      </button>

      <ErrorBoundary
        key={resetCount}
        onReset={() => {
          setShouldThrow(false);
          setResetCount((c) => c + 1);
        }}
      >
        {shouldThrow ? <BrokenComponent /> : <StableComponent />}
      </ErrorBoundary>
    </div>
  );
}
