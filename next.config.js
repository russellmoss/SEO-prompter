/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    unoptimized: true,
    domains: ['localhost']
  },
  trailingSlash: true
}

module.exports = nextConfig 