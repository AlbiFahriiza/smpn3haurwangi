import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // firebase-admin hanya berjalan di server & memuat binari native gRPC:
  // jangan dibundel webpack.
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
