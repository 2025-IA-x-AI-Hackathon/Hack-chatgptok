import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "ss-s3-project.s3.ap-northeast-2.amazonaws.com"
      }
    ],
  },
};

export default nextConfig;
