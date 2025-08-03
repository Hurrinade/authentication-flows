import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

let url = "http://localhost:3001";
if (isProduction) {
  url = "https://authapi.rinadely.com";
} else if (isTest) {
  url = "http://dev-server:3000";
}

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: url + "/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
