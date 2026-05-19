/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    '192.168.1.5',
    '192.168.1.5:3000',
    'http://192.168.1.5:3000'
  ],
  output: 'standalone',
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
  },

};

export default nextConfig;