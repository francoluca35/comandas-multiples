/** @type {import('next').NextConfig} */
const nextConfig = {
  // Para desarrollo con Electron, no usamos export estático
  // output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  assetPrefix: process.env.NODE_ENV === "development" ? "" : "./",
  basePath: "",
};

export default nextConfig;
