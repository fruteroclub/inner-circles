/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config: {
    resolve: { fallback: { fs: boolean; net: boolean; tls: boolean } };
  }) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ipfs.io",
      },
      {
        protocol: "https",
        hostname: "euc.li",
      },
      {
        protocol: "https",
        hostname: "regen-tips-git-dev-regentoken.vercel.app",
      },
    ],
  },
};

export default nextConfig;
