"use client";

import { useState } from "react";
import Link from "next/link";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  coverUrl?: string | null;
  createdAt: string;
}

interface FullPost extends BlogPost {
  content?: string;
}

export default function BlogFeed({ initialPosts }: { initialPosts: BlogPost[] }) {
  const [openPost, setOpenPost] = useState<FullPost | null>(null);
  const [loading, setLoading] = useState(false);

  const openPostPopup = async (id: string) => {
    setLoading(true);

    // Fetch full post from Supabase API
    const res = await fetch(`/api/blog/${id}`);
    const data = await res.json();

    setOpenPost(data);
    setLoading(false);
  };

  const closePopup = () => setOpenPost(null);

  return (
    <>
      {/* Feed */}
      <div className="flex flex-col gap-6 w-full">
        {initialPosts.map((post) => (
          <div
            key={post.id}
            onClick={() => openPostPopup(post.id)}
            className="cursor-pointer rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 pt-4">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{post.title}</p>
                <p className="text-xs text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-4">
              {post.coverUrl && (
                <img
                  src={post.coverUrl}
                  alt={post.title}
                  className="w-full h-80 object-cover rounded-xl my-3"
                />
              )}
              <p className="text-gray-800 dark:text-gray-200 text-base whitespace-pre-line mb-3">
                {post.excerpt}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Popup Modal */}
      {openPost && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
          onClick={closePopup}
        >
          <div
            className="bg-white dark:bg-neutral-900 max-w-3xl w-full rounded-2xl overflow-y-auto max-h-[90vh] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {openPost.coverUrl && (
              <img
                src={openPost.coverUrl}
                alt={openPost.title}
                className="w-full h-96 object-cover"
              />
            )}
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                {openPost.title}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                {new Date(openPost.createdAt).toLocaleDateString()}
              </p>
              <article
                className="text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed"
                dangerouslySetInnerHTML={{ __html: openPost.content || "" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-white">
          Loading...
        </div>
      )}
    </>
  );
}