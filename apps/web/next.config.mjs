/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@marin-froid/db", "@marin-froid/email", "@marin-froid/types"],
};

export default nextConfig;
