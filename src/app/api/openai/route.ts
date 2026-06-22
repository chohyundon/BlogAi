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

const COMPLETION_TOKEN_LIMIT = 4000;

type TokenParams = { max_tokens: number } | { max_completion_tokens: number };

/** gpt-5 / o-series 등 신규 모델은 max_tokens 대신 max_completion_tokens 사용 */
function completionTokenParam(
  model: string,
  preferCompletionTokens?: boolean
): TokenParams {
  const usesCompletionTokens =
    preferCompletionTokens ??
    (/^gpt-5/i.test(model) || /^o\d/i.test(model) || /^gpt-4\.1/i.test(model));

  return usesCompletionTokens
    ? { max_completion_tokens: COMPLETION_TOKEN_LIMIT }
    : { max_tokens: COMPLETION_TOKEN_LIMIT };
}

function flipTokenParam(current: TokenParams): TokenParams {
  return "max_tokens" in current
    ? { max_completion_tokens: COMPLETION_TOKEN_LIMIT }
    : { max_tokens: COMPLETION_TOKEN_LIMIT };
}

function isTokenParamError(message: string): boolean {
  return (
    message.includes("max_completion_tokens") || message.includes("max_tokens")
  );
}

async function createChatCompletion(
  openai: OpenAI,
  model: string,
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
) {
  const tokenParam = completionTokenParam(model);

  try {
    return await openai.chat.completions.create({
      model,
      messages,
      ...tokenParam,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!isTokenParamError(message)) throw error;

    return openai.chat.completions.create({
      model,
      messages,
      ...flipTokenParam(tokenParam),
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "요청 본문이 올바른 JSON이 아닙니다." },
        { status: 400 }
      );
    }

    const { topicStr, description, keywords, styleKey } =
      parseBlogGenerationBody(body as Record<string, unknown>);

    if (!topicStr.trim()) {
      return NextResponse.json(
        { error: "블로그 제목이 필요합니다." },
        { status: 400 }
      );
    }

    const limitGate = await gateStoredPostLimitForAi();
    if (!limitGate.ok) {
      return NextResponse.json(
        { error: limitGate.error },
        { status: limitGate.status }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY가 설정되지 않았습니다.");
      return NextResponse.json(
        { error: "서버 설정 오류입니다." },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const systemPrompt = getSystemPrompt(styleKey);
    const userPrompt = buildUserPrompt(topicStr, description, keywords);
    const model = (process.env.OPENAI_MODEL || "gpt-4o-mini").trim();

    const completion = await createChatCompletion(openai, model, [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    const content = completion.choices[0]?.message?.content?.trim();
    const result = parseModelJsonOutput(content ?? "");
    const keywordsResult = normalizeKeywords(result);
    return NextResponse.json({
      ...result,
      keywords: keywordsResult,
    });
  } catch (error) {
    console.error("API Error:", error);
    const message = error instanceof Error ? error.message : String(error);
    const status = isAiClientErrorMessage(message) ? 400 : 500;
    return NextResponse.json(
      {
        error: "글 생성에 실패했습니다.",
        details: message,
      },
      { status }
    );
  }
}
