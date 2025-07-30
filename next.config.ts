import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // Disable Vercel image optimization
    domains: [
      'vlwyhxgzpfdotkmwiema.supabase.co',
      'huosvtlyyxtqjnqlbcaw.supabase.co',
      'images.unsplash.com'
    ],
  },
  /* config options here */
};

export default nextConfig;
