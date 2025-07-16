import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://dev-server:3000/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
