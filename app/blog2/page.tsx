import Image from "next/image";
import BlogGridWithModal from "@/components/blog-grid-with-modal";
import { createClient } from "@/utils/supabase/server";

export default async function BlogGridPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, category, cover_url, excerpt, published, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(12);

  const posts = (data || []).map((row: any) => ({
    id: row.id as string,
    title: row.title as string,
    category: (row.category as string) ?? "Blog",
    coverUrl: (row.cover_url as string) || "/icon.svg",
    excerpt: (row.excerpt as string) ?? "",
    createdAt: row.created_at as string,
  }));

  return (
    <main className="min-h-screen">
      <section className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-900">Блог - вариант 2</h1>

        {error && (
          <p className="mb-6 text-sm text-red-600">Не удалось загрузить записи блога</p>
        )}

        {posts.length === 0 ? (
          <p className="text-gray-600">Пока нет опубликованных записей.</p>
        ) : (
          <BlogGridWithModal posts={posts} />
        )}
      </section>
    </main>
  );
}


