"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createClient } from "@/utils/supabase/client";

type PostPreview = {
  id: string;
  title: string;
  category: string;
  coverUrl: string;
  excerpt: string;
  createdAt: string;
};

type FullPost = {
  id: string;
  title: string;
  category: string | null;
  cover_url: string | null;
  content: string | null;
  created_at: string;
};

export default function BlogGridWithModal({ posts }: { posts: PostPreview[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [fullPost, setFullPost] = useState<FullPost | null>(null);
  const [loading, setLoading] = useState(false);

  const openPost = (postId: string) => {
    setSelectedPostId(postId);
    setIsDialogOpen(true);
  };

  const closePost = () => {
    setIsDialogOpen(false);
  };

  useEffect(() => {
    const fetchFullPost = async () => {
      if (!isDialogOpen || !selectedPostId) return;
      setLoading(true);
      const { data } = await supabase
        .from("blog_posts")
        .select("id, title, category, cover_url, content, created_at")
        .eq("id", selectedPostId)
        .single();
      setFullPost((data as FullPost) || null);
      setLoading(false);
    };
    fetchFullPost();
  }, [isDialogOpen, selectedPostId, supabase]);

  useEffect(() => {
    if (!isDialogOpen) {
      setTimeout(() => {
        setSelectedPostId(null);
        setFullPost(null);
        setLoading(false);
      }, 200);
    }
  }, [isDialogOpen]);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <button
            key={post.id}
            type="button"
            onClick={() => openPost(post.id)}
            className="block text-left group"
          >
            <Card className="overflow-hidden transition-shadow group-hover:shadow-lg">
              <div className="relative aspect-[16/9] bg-white">
                <Image
                  src={post.coverUrl}
                  alt={post.title}
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-[1.01] transition-transform duration-300"
                />
                <div className="absolute left-2 top-2">
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">{post.category}</Badge>
                </div>
              </div>
              <CardContent className="space-y-3 py-4">
                <h3 className="line-clamp-2 text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                  {post.title}
                </h3>
                {post.excerpt && <p className="line-clamp-3 text-sm text-gray-600">{post.excerpt}</p>}
                <span className="inline-flex items-center rounded-md bg-blue-500 px-3 py-1.5 text-sm font-medium text-white transition-colors group-hover:bg-blue-600">
                  Подробнее
                </span>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          {loading ? (
            <div className="py-10 text-center text-sm text-gray-500">Загрузка…</div>
          ) : fullPost ? (
            <article>
              <DialogHeader>
                <DialogTitle>{fullPost.title}</DialogTitle>
              </DialogHeader>
              {fullPost.cover_url && (
                <div className="relative mt-3 aspect-[16/9] overflow-hidden rounded-lg bg-white">
                  <Image
                    src={fullPost.cover_url}
                    alt={fullPost.title}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              )}
              <div className="prose prose-slate mt-4 max-w-none prose-headings:font-semibold">
                {fullPost.content ? (
                  <div dangerouslySetInnerHTML={{ __html: fullPost.content }} />
                ) : (
                  <p className="text-gray-600">Нет содержимого.</p>
                )}
              </div>
            </article>
          ) : (
            <div className="py-10 text-center text-sm text-gray-500">Пост не найден</div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}


