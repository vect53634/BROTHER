/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Remove practical upload caps for ad media uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '5gb',
    },
    proxyClientMaxBodySize: 5368709120,
  },
}

export default nextConfig
