import { validatePostInsertBody } from "@/entities/template/api/validatePostInsertRequest";
import { createClient } from "@/shared/api/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const isDev = process.env.NODE_ENV === "development";

export async function POST(request: NextRequest) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: "요청 본문이 올바른 JSON이 아닙니다." },
      { status: 400 }
    );
  }

  const validated = validatePostInsertBody(json);
  if (!validated.ok) {
    return NextResponse.json(
      { error: validated.message },
      { status: validated.status }
    );
  }

  const { title, content, keywords, template_type } = validated.value;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "인증이 필요합니다. 다시 로그인해 주세요." },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from("posts")
    .insert([
      {
        title,
        content,
        keywords,
        template_type,
        user_id: user.id,
      },
    ])
    .select();

  if (error) {
    console.error("Supabase posts insert:", error);
    return NextResponse.json(
      {
        error: "글 저장에 실패했습니다.",
        ...(isDev ? { details: error.message } : {}),
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}
