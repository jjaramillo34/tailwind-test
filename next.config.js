/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Without this, server components importing the Once UI root ship ~110 kB extra JS per route.
    optimizePackageImports: ['@once-ui-system/core'],
  },
};

module.exports = nextConfig;
