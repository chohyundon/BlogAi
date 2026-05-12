import {
  isAiClientErrorMessage,
  normalizeKeywords,
  parseModelJsonOutput,
  publicAiErrorMessage,
  sseEncode,
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
        { status: 400 },
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
        { status: limitGate.status },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY ?? process.env.GEMINI_APT_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY가 설정되지 않았습니다.");
      return NextResponse.json(
        { error: "서버 설정 오류입니다." },
        { status: 500 },
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const systemPrompt = getSystemPrompt(styleKey);
    const userPrompt = buildUserPrompt(topicStr, description, keywords);

    if (wantStream) {
      const model = genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
        systemInstruction: systemPrompt,
        generationConfig: {
          maxOutputTokens: 8192,
        },
      });

      const stream = new ReadableStream({
        async start(controller) {
          const push = (obj: unknown) => controller.enqueue(sseEncode(obj));
          try {
            const streamResult = await model.generateContentStream(userPrompt);
            let full = "";
            for await (const chunk of streamResult.stream) {
              const text = chunk.text();
              if (text) {
                full += text;
                push({ type: "delta", chunk: text });
              }
            }

            const trimmed = full.trim();
            const result = parseModelJsonOutput(trimmed);
            const keywordsResult = normalizeKeywords(result);
            push({
              type: "done",
              title: result.title ?? "",
              content: result.content ?? "",
              keywords: keywordsResult,
              metaDescription: result.metaDescription ?? "",
            });
          } catch (error) {
            console.error("Gemini stream error:", error);
            push({ type: "error", message: publicAiErrorMessage(error) });
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
      systemInstruction: systemPrompt,
      generationConfig: {
        maxOutputTokens: 8192,
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
    const message =
      error instanceof Error ? error.message : String(error);
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
