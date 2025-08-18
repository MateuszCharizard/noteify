/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/@:profile',
        destination: '/[profile]',
      },
    ];
  },
};

export default nextConfig;
