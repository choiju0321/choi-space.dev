import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/life/cafe",
        destination: "/life/food",
        permanent: true,
      },
      {
        source: "/life/cafe/:slug",
        destination: "/life/food/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
