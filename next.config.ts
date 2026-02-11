import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ok*.cdn.okta.com",
      },
      {
        protocol: "https",
        hostname: "*.oktacdn.com",
      },
    ],
  },
};

export default nextConfig;
