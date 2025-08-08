import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/server";

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, category, cover_url, content, created_at, published")
    .eq("id", id)
    .single();

  if (error || !data || data.published === false) {
    return (
      <main className="container mx-auto min-h-screen px-4 py-8">
        <p className="text-red-600">Пост не найден.</p>
        <Link href="/blog2" className="mt-4 inline-block text-blue-600 hover:underline">
          Вернуться ко всем записям
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <article className="container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-4">
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">{data.category || "Blog"}</Badge>
        </div>
        <h1 className="mb-4 text-3xl font-bold text-gray-900">{data.title}</h1>
        {data.cover_url && (
          <div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-lg bg-white">
            <Image src={data.cover_url} alt={data.title} fill unoptimized className="object-cover" />
          </div>
        )}
        {data.content ? (
          <div className="prose prose-slate max-w-none prose-headings:font-semibold">
            {/* Assuming content is plain text or HTML. If markdown, parse it accordingly in future. */}
            <div dangerouslySetInnerHTML={{ __html: data.content }} />
          </div>
        ) : (
          <p className="text-gray-600">Нет содержимого.</p>
        )}

        <div className="mt-8">
          <Link
            href="/blog2"
            className="inline-flex items-center rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            ← Ко всем записям
          </Link>
        </div>
      </article>
    </main>
  );
}


