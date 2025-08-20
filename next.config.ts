import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images:{
    domains: ["firebasestorage.googleapis.com"]
  },
  output: "standalone"
};

export default nextConfig;
