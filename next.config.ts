import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config: any, { isServer }: any) => {
    if (isServer) {
      config.externals = [
        ...config.externals,
        { "@prisma/client": "@prisma/client" },
      ];
    }
    return config;
  },
  turbopack: {},
};
export default nextConfig;
