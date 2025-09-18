/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Enable static export for Capacitor
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  // Disable server-side features for static export
  experimental: {
    esmExternals: false,
  },
}

export default nextConfig
