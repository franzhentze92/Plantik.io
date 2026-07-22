/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "gt.epaenlinea.com" },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: [
      "@imgly/background-removal-node",
      "onnxruntime-node",
      "sharp",
    ],
  },
};

export default nextConfig;
