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
      ...(r2Host ? [{
        protocol: r2Host.protocol,
        hostname: r2Host.hostname,
        port: r2Host.port,
      }] : [])
    ],
  },
};

export default nextConfig;
