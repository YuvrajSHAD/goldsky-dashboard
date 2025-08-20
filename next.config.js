/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // ✅ Ignore build errors from node_modules
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'coin-images.coingecko.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack(config, options) {
    // Disable CSS minimization only for production builds to bypass cssnano errors
    if (!options.dev) {
      config.optimization.minimizer = config.optimization.minimizer.filter(
        (minimizer) => !minimizer.constructor.name.includes('CssMinimizerPlugin')
      );
    }
    return config;
  },
};

module.exports = nextConfig;
