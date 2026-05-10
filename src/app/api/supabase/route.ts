import { createClient } from "@/shared/api/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { title, content, keywords, template_type } = await request.json();

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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data, error });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  const supabase = await createClient();

  const { data, error } = await supabase.from("posts").select("*").eq("id", id);
  return NextResponse.json({ data, error });
}
