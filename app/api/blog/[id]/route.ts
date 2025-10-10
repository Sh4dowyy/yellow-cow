import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, content, cover_url, created_at")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: data.id,
    title: data.title,
    content: data.content,
    coverUrl: data.cover_url,
    createdAt: data.created_at,
  });
}