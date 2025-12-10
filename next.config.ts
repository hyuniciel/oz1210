import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      { hostname: "apis.data.go.kr" }, // 한국관광공사 API
      { hostname: "tong.visitkorea.or.kr" }, // 한국관광공사 이미지
    ],
  },
};

export default nextConfig;
