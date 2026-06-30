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
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const isDev = process.env.NODE_ENV === "development";
const COMPLETION_TOKEN_LIMIT = 4000;

/** gpt-5 / o-series 등 신규 모델은 max_tokens 대신 max_completion_tokens 사용 */
function completionTokenParam(model: string) {
  const usesCompletionTokens =
    /^gpt-5/i.test(model) || /^o\d/i.test(model) || /^gpt-4\.1/i.test(model);

  return usesCompletionTokens
    ? { max_completion_tokens: COMPLETION_TOKEN_LIMIT }
    : { max_tokens: COMPLETION_TOKEN_LIMIT };
}

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

    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY가 설정되지 않았습니다.");
      return NextResponse.json(
        { error: "서버 설정 오류입니다." },
        { status: 500 },
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const systemPrompt = getSystemPrompt(styleKey);
    const userPrompt = buildUserPrompt(topicStr, description, keywords);
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const completion = await openai.chat.completions.create(
      {
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        ...completionTokenParam(model),
      },
      { signal: request.signal },
    );

    if (request.signal.aborted) {
      return new Response(null, { status: 499 });
    }

    const content = completion.choices[0]?.message?.content?.trim();
    const result = parseModelJsonOutput(content ?? "");
    const keywordsResult = normalizeKeywords(result);
    return NextResponse.json({
      ...result,
      keywords: keywordsResult,
    });
  } catch (error) {
    if (isClientAbort(request, error)) {
      return new Response(null, { status: 499 });
    }

    console.error("API Error:", error);
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
