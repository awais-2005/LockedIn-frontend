/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [{
          key: "Cross-Origin-Opener-Policy",
          value: "unsafe-none",
        }],
      },
    ];
  },
  async rewrites() {
    return [{ source: '/api/:path*', destination: 'https://lockedin-lj34.onrender.com/api/:path*' }];
  }
};

module.exports = nextConfig;
