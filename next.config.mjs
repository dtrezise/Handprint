const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath,
  images: {
    unoptimized: Boolean(basePath)
  }
};

export default nextConfig;
