import { fileURLToPath } from 'node:url';
/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.NEXT_PUBLIC_APP_BASE_PATH || '',
  reactStrictMode: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  turbopack: { root: fileURLToPath(new URL('.', import.meta.url)) },
};

export default nextConfig;
