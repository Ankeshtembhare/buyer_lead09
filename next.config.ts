import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Exclude problematic files from webpack processing
    config.module.rules.push({
      test: /\.(txt|md|LICENSE)$/,
      type: 'asset/resource',
    });
    return config;
  },
  experimental: {
    // Disable turbopack for production builds
    turbo: {
      rules: {
        '*.txt': {
          loaders: ['ignore-loader'],
        },
        '*.md': {
          loaders: ['ignore-loader'],
        },
        '**/LICENSE': {
          loaders: ['ignore-loader'],
        },
      },
    },
  },
};

export default nextConfig;
