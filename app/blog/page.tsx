import AppleCardsCarouselDemo from "@/components/apple-cards-carousel-demo";
import { createClient } from "@/utils/supabase/server";

export default async function BlogPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("title, category, cover_url, excerpt, published, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(6);

  const items = (data || []).map((row: any) => ({
    title: row.title,
    category: row.category ?? "Blog",
    src: row.cover_url,
    content: row.excerpt ?? "",
  }));

  return (
    <main className="min-h-screen">
      <AppleCardsCarouselDemo items={items} />
    </main>
  );
}

