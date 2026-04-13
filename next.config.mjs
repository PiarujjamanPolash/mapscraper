/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure firebase-admin runs in Node.js runtime (not Edge)
  experimental: {},
  // Exclude firebase-admin from client-side bundles
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
