import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Painel administrativo", template: "%s | Painel Toninho Imóveis" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return <div className="flex min-h-full flex-1 flex-col bg-slate-100">{children}</div>;
}
