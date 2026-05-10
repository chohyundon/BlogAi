import {
  buildUserPrompt,
  getSystemPrompt,
  parseBlogGenerationBody,
} from "@/shared/lib/blogGenerationPrompt";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

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

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content?.trim();
    let result: Record<string, unknown> = {};
    if (content) {
      try {
        result = JSON.parse(content) as Record<string, unknown>;
      } catch {
        result = { title: "", content, keywords: [], metaDescription: "" };
      }
    }

    const keywordsResult = Array.isArray(result.keywords)
      ? result.keywords
      : Array.isArray(result.hashtags)
      ? result.hashtags
      : [];
    return NextResponse.json({
      ...result,
      keywords: keywordsResult,
    });
  } catch (error) {
    console.error("API Error:", error);
    const message = error instanceof Error ? error.message : String(error);
    const status =
      message.includes("400") || message.includes("Invalid") ? 400 : 500;
    return NextResponse.json(
      { error: "글 생성에 실패했습니다.", details: message },
      { status }
    );
  }
}
