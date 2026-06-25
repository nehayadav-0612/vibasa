/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Allow requests from local dev origin IPs (needed for future Next.js versions)
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],
}

export default nextConfig
