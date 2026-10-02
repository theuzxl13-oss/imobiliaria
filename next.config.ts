import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
  : null;

const isLocalSupabase =
  supabaseUrl?.hostname === "127.0.0.1" || supabaseUrl?.hostname === "localhost";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Fotos enviadas pelo painel (Supabase Storage)
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      ...(supabaseUrl
        ? [
            {
              protocol: supabaseUrl.protocol.replace(":", "") as "http" | "https",
              hostname: supabaseUrl.hostname,
              port: supabaseUrl.port,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
      // Fotos ilustrativas dos imóveis de demonstração
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    qualities: [75, 85],
    formats: ["image/avif", "image/webp"],
    // Permite otimizar imagens do Supabase local (somente em desenvolvimento)
    dangerouslyAllowLocalIP: isLocalSupabase,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
