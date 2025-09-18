/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Enable static export for Capacitor
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  // Disable server-side features for static export
  experimental: {
    esmExternals: false,
  },
  // Add asset prefix for static export
  assetPrefix: '',
  // Disable image optimization
  images: {
    unoptimized: true,
  }
}

export default nextConfig
