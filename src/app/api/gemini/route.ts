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
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const isDev = process.env.NODE_ENV === "development";

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

    const genAI = new GoogleGenerativeAI(apiKey);
    const systemPrompt = getSystemPrompt(styleKey);
    const userPrompt = buildUserPrompt(topicStr, description, keywords);

    const model = genAI.getGenerativeModel({
      model: getGeminiModel(),
      systemInstruction: systemPrompt,
      generationConfig: {
        maxOutputTokens: 2000,
        responseMimeType: "application/json",
      },
    });

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get("topic") ?? "기본 주제";

    console.log("SSE 요청 시작:", { topic });

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      console.error(
        "GEMINI_API_KEY(또는 NEXT_PUBLIC_GEMINI_API_KEY)가 설정되지 않았습니다"
      );
      return new Response("GEMINI API 키가 설정되지 않았습니다", {
        status: 500,
      });
    }

    console.log("API 키 확인됨");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: getGeminiModel(),
    });

    console.log("모델 초기화 완료");

    const readable = new ReadableStream({
      async start(controller) {
        try {
          const encoder = new TextEncoder();

          console.log("스트림 생성 시작");
          controller.enqueue(
            encoder.encode(`data: 연결됨! 주제: ${topic}\n\n`)
          );

          const result = await model.generateContentStream(topic);
          console.log("Gemini 스트림 시작");

          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              console.log("청크 받음:", text.substring(0, 50) + "...");
              controller.enqueue(encoder.encode(`data: ${text}\n\n`));
            }
          }

          console.log("스트림 완료");
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (streamError) {
          console.error("스트림 에러:", streamError);
          const encoder = new TextEncoder();
          controller.enqueue(
            encoder.encode(`data: 에러 발생: ${streamError}\n\n`)
          );
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("SSE GET 에러:", error);
    return new Response(
      JSON.stringify({
        error: "SSE 연결 실패",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
