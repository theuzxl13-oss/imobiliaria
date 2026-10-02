import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { SITE_URL } from "@/lib/env";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Toninho Imóveis — Casas, apartamentos e terrenos para comprar e alugar",
    template: "%s | Toninho Imóveis",
  },
  description:
    "Encontre o imóvel ideal com a Toninho Imóveis: casas, apartamentos, terrenos, chácaras e imóveis comerciais para venda e aluguel, com atendimento próximo e seguro.",
  applicationName: "Toninho Imóveis",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Toninho Imóveis",
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0b2140",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${jakarta.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        {children}
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}
