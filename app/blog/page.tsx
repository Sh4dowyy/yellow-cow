import BlogFeed from "../../components/blog-feed";
import { createClient } from "@/utils/supabase/server";

export default async function BlogPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("id, title, excerpt, cover_url, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(10);

  const initialPosts = (data || []).map((row: any) => ({
    id: row.id as string,
    title: (row.title as string) || "",
    excerpt: (row.excerpt as string) || "",
    coverUrl: (row.cover_url as string) || null,
    createdAt: row.created_at as string,
  }));

  return (
    <main className="min-h-screen">
      <section className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-900">Лента</h1>
        <BlogFeed initialPosts={initialPosts} />
      </section>
    </main>
  );
}


