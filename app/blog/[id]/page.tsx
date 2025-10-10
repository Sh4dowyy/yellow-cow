import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

// Define the blog post type
interface BlogPost {
  id: string;
  title: string;
  content: string;
  cover_url: string | null;
  created_at: string;
}

// Dynamic page component
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, content, cover_url, created_at")
    .eq("id", id)
    .single();

  if (error || !data) return notFound();

  const post: BlogPost = {
    id: data.id,
    title: data.title,
    content: data.content,
    cover_url: data.cover_url,
    created_at: data.created_at,
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-neutral-950 py-8">
      <section className="max-w-3xl mx-auto bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-6">
          <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-neutral-700" />
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {post.title}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Image */}
        {post.cover_url && (
          <img
            src={post.cover_url}
            alt={post.title}
            className="w-full h-96 object-cover mt-4"
          />
        )}

        {/* Content */}
        <div className="px-6 py-4">
          <article className="text-gray-800 dark:text-gray-200 text-base leading-relaxed whitespace-pre-line">
            {post.content}
          </article>
        </div>
      </section>
    </main>
  );
}