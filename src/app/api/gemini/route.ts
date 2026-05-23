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
import { encodeSseEvent } from "@/shared/lib/sseEncode";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const isDev = process.env.NODE_ENV === "development";

const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
};

type GenerationInput = {
  topicStr: string;
  description: string;
  keywords: string[];
  styleKey: string;
};

async function createGeminiModel(styleKey: string) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY_NOT_SET");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: getGeminiModel(),
    systemInstruction: getSystemPrompt(styleKey),
    generationConfig: {
      maxOutputTokens: 2000,
      responseMimeType: "application/json",
    },
  });
}

function streamGeminiArticle(input: GenerationInput): Response {
  const { topicStr, description, keywords, styleKey } = input;
  const userPrompt = buildUserPrompt(topicStr, description, keywords);

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const model = await createGeminiModel(styleKey);
        const result = await model.generateContentStream(userPrompt);
        let raw = "";

        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (!text) continue;
          raw += text;
          controller.enqueue(encodeSseEvent(text, "chunk"));
        }

        const parsed = parseModelJsonOutput(raw.trim());
        const keywordsResult = normalizeKeywords(parsed);
        const article = {
          title: String(parsed.title ?? ""),
          content: String(parsed.content ?? ""),
          keywords: keywordsResult,
          metaDescription: String(parsed.metaDescription ?? ""),
        };

        controller.enqueue(encodeSseEvent(JSON.stringify(article), "result"));
        controller.enqueue(encodeSseEvent("[DONE]", "done"));
        controller.close();
      } catch (streamError) {
        const message =
          streamError instanceof Error
            ? streamError.message
            : String(streamError);
        controller.enqueue(encodeSseEvent(message, "error"));
        controller.enqueue(encodeSseEvent("[DONE]", "done"));
        controller.close();
      }
    },
  });

  return new Response(readable, { headers: SSE_HEADERS });
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

    const limitGate = await gateStoredPostLimitForAi();
    if (!limitGate.ok) {
      return NextResponse.json(
        { error: limitGate.error },
        { status: limitGate.status }
      );
    }

    const wantsStream = (request.headers.get("accept") ?? "").includes(
      "text/event-stream"
    );

    if (wantsStream) {
      if (!getGeminiApiKey()) {
        console.error(
          "GEMINI_API_KEY(또는 NEXT_PUBLIC_GEMINI_API_KEY)가 설정되지 않았습니다."
        );
        return NextResponse.json(
          { error: "서버 설정 오류입니다." },
          { status: 500 }
        );
      }

      return streamGeminiArticle({
        topicStr,
        description,
        keywords,
        styleKey,
      });
    }

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      console.error(
        "GEMINI_API_KEY(또는 NEXT_PUBLIC_GEMINI_API_KEY)가 설정되지 않았습니다."
      );
      return NextResponse.json(
        { error: "서버 설정 오류입니다." },
        { status: 500 }
      );
    }

    const model = await createGeminiModel(styleKey);
    const userPrompt = buildUserPrompt(topicStr, description, keywords);
    const completion = await model.generateContent(userPrompt);
    const content = completion.response.text()?.trim();
    const result = parseModelJsonOutput(content ?? "");
    const keywordsResult = normalizeKeywords(result);
    return NextResponse.json({
      ...result,
      keywords: keywordsResult,
    });
  } catch (error) {
    console.error("Gemini API Error:", error);
    const message = error instanceof Error ? error.message : String(error);
    const status = isAiClientErrorMessage(message) ? 400 : 500;
    return NextResponse.json(
      {
        error: "글 생성에 실패했습니다.",
        ...(isDev ? { details: message } : {}),
      },
      { status }
    );
  }
}
