/** @type {import('next').NextConfig} */
const nextConfig = {
  // your config options here
  eslint: {
    // Disable ESLint during builds to avoid potential errors
    ignoreDuringBuilds: false,
    dirs: ['src']
  }
};

module.exports = nextConfig;