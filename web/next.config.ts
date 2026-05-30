import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.lovart.ai',
        pathname: '/**'
      }
    ]
  }
};

export default nextConfig;
