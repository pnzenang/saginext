import { withNextVideo } from "next-video/process";
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH ?? '',
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb'
    }
  },
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx']
}

export default withNextVideo(nextConfig);
