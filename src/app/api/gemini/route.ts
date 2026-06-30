import {
  isAiClientErrorMessage,
  normalizeKeywords,
  parseModelJsonOutput,
} from "@/shared/lib/aiRouteCommon";
import {
  buildUserPrompt,
  getSystemPrompt,
  parseBlogGenerationBody,
} from "@/shared/lib/blogGenerationPrompt";
import { gateStoredPostLimitForAi } from "@/entities/template/api/gateStoredPostLimitForAi";
import { getGeminiApiKey, getGeminiModel } from "@/shared/lib/geminiEnv";
import { NextRequest, NextResponse } from "next/server";

const isDev = process.env.NODE_ENV === "development";

function isClientAbort(request: NextRequest, error: unknown): boolean {
  return (
    request.signal.aborted ||
    (error instanceof Error && error.name === "AbortError")
  );
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "요청 본문이 올바른 JSON이 아닙니다." },
        { status: 400 },
      );
    }

    const { topicStr, description, keywords, styleKey } =
      parseBlogGenerationBody(body as Record<string, unknown>);

    const limitGate = await gateStoredPostLimitForAi();
    if (request.signal.aborted) {
      return new Response(null, { status: 499 });
    }
    if (!limitGate.ok) {
      return NextResponse.json(
        { error: limitGate.error },
        { status: limitGate.status },
      );
    }

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      console.error(
        "GEMINI_API_KEY(또는 NEXT_PUBLIC_GEMINI_API_KEY)가 설정되지 않았습니다.",
      );
      return NextResponse.json(
        { error: "서버 설정 오류입니다." },
        { status: 500 },
      );
    }

    const userPrompt = buildUserPrompt(topicStr, description, keywords);
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${getGeminiModel()}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: request.signal,
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: getSystemPrompt(styleKey) }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: userPrompt }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 2000,
            responseMimeType: "application/json",
          },
        }),
      },
    );

    if (request.signal.aborted) {
      return new Response(null, { status: 499 });
    }

    if (!res.ok) {
      throw new Error(`Gemini HTTP ${res.status}`);
    }

    const data = await res.json();
    const content =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    const result = parseModelJsonOutput(content);
    const keywordsResult = normalizeKeywords(result);

    return NextResponse.json({
      ...result,
      keywords: keywordsResult,
    });
  } catch (error) {
    if (isClientAbort(request, error)) {
      return new Response(null, { status: 499 });
    }

    console.error("Gemini API Error:", error);
    const message = error instanceof Error ? error.message : String(error);
    const status = isAiClientErrorMessage(message) ? 400 : 500;
    return NextResponse.json(
      {
        error: "글 생성에 실패했습니다.",
        ...(isDev ? { details: message } : {}),
      },
      { status },
    );
  }
}
