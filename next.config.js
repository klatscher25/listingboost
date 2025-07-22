/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is default in Next.js 14+
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'a0.muscache.com',
        port: '',
        pathname: '/im/**',
      },
      {
        protocol: 'https',
        hostname: '*.muscache.com',
        port: '',
        pathname: '/im/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      }
    ],
  },
}

module.exports = nextConfig
