import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: ['avatars.githubusercontent.com'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Forwarded-Host', value: 'ragprwebapps-asfeagcmfydzecb4.japaneast-01.azurewebsites.net' },
          { key: 'X-Forwarded-Proto', value: 'https' },
        ],
      },
    ];
  },
};

export default nextConfig;
