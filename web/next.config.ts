import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.lovart.ai', pathname: '/**' }
    ]
  },
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${backendUrl}/api/:path*` },
      { source: '/assets/:path*', destination: `${backendUrl}/assets/:path*` }
    ];
  }
};

export default withNextIntl(nextConfig);
