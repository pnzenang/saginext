import { withNextVideo } from "next-video/process";
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH ?? '',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/dp8tkb7hq/image/upload/**'
      }
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb'
    }
  },
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  turbopack: {
    root: process.cwd()
  }
}

export default withNextVideo(nextConfig);
