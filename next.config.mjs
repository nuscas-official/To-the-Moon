const getR2Host = () => {
  const url = process.env.CLOUDFLARE_R2_PUBLIC_URL;
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return {
      protocol: parsed.protocol.replace(':', ''),
      hostname: parsed.hostname,
      port: parsed.port || '',
    };
  } catch {
    return null;
  }
};

const r2Host = getR2Host();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep sharp external so its native binaries load at runtime on Vercel
  // instead of being bundled into the serverless function (which breaks image
  // uploads with a 500 in production).
  experimental: {
    serverComponentsExternalPackages: ['sharp'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // YouTube poster frames for FeaturedVideo's click-to-play facade
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      ...(r2Host ? [{
        protocol: r2Host.protocol,
        hostname: r2Host.hostname,
        port: r2Host.port,
      }] : [])
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self';",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline';",
              "style-src 'self' 'unsafe-inline';",
              "img-src 'self' blob: data: https:;",
              "font-src 'self' data:;",
              "connect-src 'self' https://graphql.anilist.co https://*.supabase.co wss://*.supabase.co;",
              "frame-src 'self' https://*.supabase.co https://www.youtube-nocookie.com;",
              "object-src 'none';",
              "base-uri 'self';",
              "form-action 'self';",
              "frame-ancestors 'none';",
              "upgrade-insecure-requests;",
            ].join(' '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
