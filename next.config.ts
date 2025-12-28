import type { NextConfig } from "next";

/**
 * Next.js Configuration
 * 
 * ====================================
 * IMAGE OPTIMIZATION
 * ====================================
 * 
 * Next.js Image component cần biết domains nào được phép load images.
 * Sử dụng `remotePatterns` thay vì `domains` (deprecated).
 * 
 * remotePatterns cho phép:
 * - Wildcard hostnames (**.ngrok-free.app)
 * - Protocol-specific (http/https)
 * - More flexible và secure
 * 
 * Use Cases:
 * 1. localhost:7207 - Backend .NET API
 * 2. **.ngrok-free.app - Testing với Ngrok tunnel
 * 3. **.amazonaws.com - Future S3 storage
 * 
 * Example:
 * <Image 
 *   src="https://abc123.ngrok-free.app/uploads/event.jpg"
 *   width={500}
 *   height={300}
 *   alt="Event"
 * />
 */

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  /**
   * Headers Configuration
   * 
   * Fix CORS issues with Google OAuth popup
   * Cross-Origin-Opener-Policy: same-origin-allow-popups
   */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
        ],
      },
    ];
  },

  /**
   * Image Optimization Configuration
   * 
   * Cho phép load images từ external sources
   */
  images: {
    remotePatterns: [
      // Backend API localhost (Development)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '7207', // .NET Backend port
        pathname: '/uploads/**', // Chỉ cho phép /uploads folder
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '7207',
        pathname: '/uploads/**',
      },

      // Ngrok tunnels (Testing với mobile/external)
      // Format: https://abc123.ngrok-free.app
      {
        protocol: 'https',
        hostname: '**.ngrok-free.app',
        pathname: '/**', // Allow all paths
      },

      // AWS S3 (Future cloud storage)
      // Format: https://bucket-name.s3.amazonaws.com/image.jpg
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
        pathname: '/**',
      },

      // AWS CloudFront CDN (Future)
      {
        protocol: 'https',
        hostname: '**.cloudfront.net',
        pathname: '/**',
      },
    ],

    /**
     * Device Sizes for Responsive Images
     * Next.js tự động generate các size này
     */
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],

    /**
     * Image Sizes for smaller images (icons, thumbnails)
     */
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    /**
     * Image Formats
     * AVIF: Better compression nhưng slower
     * WebP: Good balance
     */
    formats: ['image/avif', 'image/webp'],

    /**
     * Minimum cache time for optimized images (seconds)
     * Default: 60 seconds
     */
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
