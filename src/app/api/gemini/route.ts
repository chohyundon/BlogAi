import {
  isAiClientErrorMessage,
  normalizeKeywords,
  parseModelJsonOutput,
  sseEncode,
  publicAiErrorMessage,
} from "@/shared/lib/aiRouteCommon";
import {
  buildUserPrompt,
  getSystemPrompt,
  parseBlogGenerationBody,
} from "@/shared/lib/blogGenerationPrompt";
import { gateStoredPostLimitForAi } from "@/entities/template/api/gateStoredPostLimitForAi";
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

    const raw = body as Record<string, unknown>;
    const wantStream = raw.stream === true;
    
    const { topicStr, description, keywords, styleKey } =
      parseBlogGenerationBody(raw);

    const limitGate = await gateStoredPostLimitForAi();
    if (!limitGate.ok) {
      return NextResponse.json(
        { error: limitGate.error },
        { status: limitGate.status }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY ?? process.env.GEMINI_APT_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY가 설정되지 않았습니다.");
      return NextResponse.json(
        { error: "서버 설정 오류입니다." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const systemPrompt = getSystemPrompt(styleKey);
    const userPrompt = buildUserPrompt(topicStr, description, keywords);

    // SSE 스트리밍 요청인 경우
    if (wantStream) {
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const model = genAI.getGenerativeModel({
              model: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
              systemInstruction: systemPrompt,
              generationConfig: {
                maxOutputTokens: 4000,
              },
            });

            const result = await model.generateContentStream(userPrompt);
            let fullContent = "";

            for await (const chunk of result.stream) {
              const delta = chunk.text();
              if (delta) {
                fullContent += delta;
                
                // 스트림으로 델타 전송
                const encoded = sseEncode("delta", JSON.stringify({
                  content: delta,
                  fullContent: fullContent,
                }));
                controller.enqueue(new TextEncoder().encode(encoded));
              }
            }

            // 최종 결과 파싱 및 전송
            const parsedResult = parseModelJsonOutput(fullContent);
            const keywordsResult = normalizeKeywords(parsedResult);
            const finalResult = {
              ...parsedResult,
              keywords: keywordsResult,
            };

            const encoded = sseEncode("complete", JSON.stringify(finalResult));
            controller.enqueue(new TextEncoder().encode(encoded));
            
          } catch (error) {
            console.error("Stream Error:", error);
            const errorMsg = publicAiErrorMessage(error);
            const encoded = sseEncode("error", JSON.stringify({ error: errorMsg }));
            controller.enqueue(new TextEncoder().encode(encoded));
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // 일반 요청인 경우 (기존 로직)
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
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
