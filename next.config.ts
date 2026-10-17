import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    // Jangan pernah merilis dengan error tipe: `next build` ikut memeriksa tipe.
    ignoreBuildErrors: false,
  },
  reactStrictMode: false,
  // firebase-admin hanya berjalan di server & memuat binari native gRPC:
  // jangan dibundel webpack.
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
