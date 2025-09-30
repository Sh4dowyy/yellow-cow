"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type FeedPost = {
  id: string;
  title: string;
  excerpt: string;
  coverUrl: string | null;
  createdAt: string;
};

export default function BlogFeed({ initialPosts }: { initialPosts: FeedPost[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [endReached, setEndReached] = useState(initialPosts.length < 10);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const pluralize = (n: number, one: string, few: string, many: string) => {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
  };

  const formatRelativeTime = (iso: string) => {
    const created = new Date(iso).getTime();
    const now = Date.now();
    const diffMs = Math.max(0, now - created);
    const minutes = Math.floor(diffMs / (60 * 1000));
    if (minutes < 60) {
      const n = Math.max(1, minutes);
      const unit = pluralize(n, "минуту", "минуты", "минут");
      return `${n} ${unit} назад`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      const unit = pluralize(hours, "час", "часа", "часов");
      return `${hours} ${unit} назад`;
    }
    const days = Math.floor(hours / 24);
    const unit = pluralize(days, "день", "дня", "дней");
    return `${days} ${unit} назад`;
  };

  const loadMore = useCallback(async () => {
    if (loading || endReached) return;
    setLoading(true);
    const from = posts.length;
    const to = from + 9;
    const { data } = await supabase
      .from("blog_posts")
      .select("id, title, excerpt, cover_url, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .range(from, to);
    const newPosts = (data || []).map((row: any) => ({
      id: row.id as string,
      title: (row.title as string) || "",
      excerpt: (row.excerpt as string) || "",
      coverUrl: (row.cover_url as string) || null,
      createdAt: row.created_at as string,
    }));
    setPosts((prev) => [...prev, ...newPosts]);
    if (!data || data.length < 10) setEndReached(true);
    setLoading(false);
  }, [endReached, loading, posts.length, supabase]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden">
          {post.coverUrl && (
            <div className="relative aspect-[16/9] bg-white">
              <Image src={post.coverUrl} alt={post.title} fill unoptimized className="object-cover" />
            </div>
          )}
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold">{post.title}</h3>
            {post.excerpt && (
              <>
                <p className={`mt-2 text-sm text-gray-600 ${expanded[post.id] ? '' : 'line-clamp-2'}`}>
                  {post.excerpt}
                </p>
                {post.excerpt.length > 120 && (
                  <button
                    type="button"
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                    onClick={() => toggleExpand(post.id)}
                  >
                    {expanded[post.id] ? 'Скрыть' : 'Показать больше'}
                  </button>
                )}
              </>
            )}
            <div className="mt-3 text-xs text-gray-400 text-right">{formatRelativeTime(post.createdAt)}</div>
          </CardContent>
        </Card>
      ))}

      {!endReached && (
        <div className="flex justify-center pt-2">
          <Button onClick={loadMore} disabled={loading}>
            {loading ? "Загрузка..." : "Показать ещё"}
          </Button>
        </div>
      )}
      {endReached && posts.length === 0 && (
        <div className="text-center text-sm text-gray-500">Пока нет записей</div>
      )}
    </div>
  );
}


