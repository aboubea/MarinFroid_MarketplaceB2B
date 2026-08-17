/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@marin-froid/db", "@marin-froid/email", "@marin-froid/types"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
