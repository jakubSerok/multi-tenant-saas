import type { NextConfig } from "next";

const nextConfig = {
  webpack: (config: any, { isServer }: any) => {
    if (isServer) {
      config.externals = [
        ...config.externals,
        { "@prisma/client": "@prisma/client" },
      ];
    }
    return config;
  },
};
export default nextConfig;
