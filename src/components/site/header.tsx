"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { Logo } from "./logo";
import { WhatsAppIcon } from "./whatsapp-icon";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/", label: "Início" },
  { href: "/comprar", label: "Comprar" },
  { href: "/alugar", label: "Alugar" },
  { href: "/imoveis", label: "Imóveis" },
  { href: "/ofertas", label: "Ofertas" },
  { href: "/sobre", label: "Sobre nós" },
  { href: "/contato", label: "Contato" },
];

export function Header({
  companyName,
  logoUrl,
  phone,
  whatsappHref,
}: {
  companyName: string;
  logoUrl: string | null;
  phone: string;
  whatsappHref: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-white/95 backdrop-blur transition-shadow",
        scrolled ? "border-slate-200 shadow-sm" : "border-transparent",
      )}
    >
      <div className="container-site flex h-[72px] items-center justify-between gap-4">
        <Link href="/" aria-label={`${companyName} — página inicial`} className="shrink-0">
          <Logo name={companyName} logoUrl={logoUrl} />
        </Link>

        <nav aria-label="Menu principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                    isActive(item.href)
                      ? "text-brand-800 bg-brand-50"
                      : "text-slate-600 hover:text-brand-800 hover:bg-slate-50",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/anuncie" className="btn btn-outline hidden px-4 py-2.5 xl:inline-flex">
            Anuncie seu imóvel
          </Link>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp hidden px-4 py-2.5 sm:inline-flex"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Falar no WhatsApp
          </a>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="btn btn-ghost p-2.5 lg:hidden"
            aria-label="Abrir menu"
            aria-expanded={open}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <div
          className={cn(
            "absolute inset-0 bg-brand-950/50 transition-opacity",
            open ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setOpen(false)}
        />
        <div
          className={cn(
            "absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex h-[72px] items-center justify-between border-b border-slate-100 px-4">
            <Logo name={companyName} logoUrl={logoUrl} />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn btn-ghost p-2.5"
              aria-label="Fechar menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav aria-label="Menu mobile" className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    tabIndex={open ? 0 : -1}
                    className={cn(
                      "block rounded-xl px-4 py-3 text-base font-semibold",
                      isActive(item.href) ? "bg-brand-50 text-brand-800" : "text-slate-700",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/anuncie"
                  onClick={() => setOpen(false)}
                  tabIndex={open ? 0 : -1}
                  className="block rounded-xl px-4 py-3 text-base font-semibold text-gold-600"
                >
                  Anuncie seu imóvel
                </Link>
              </li>
            </ul>
          </nav>
          <div className="space-y-2 border-t border-slate-100 p-4">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={open ? 0 : -1}
              className="btn btn-whatsapp w-full"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Falar no WhatsApp
            </a>
            {phone && (
              <a href={`tel:${phone.replace(/\D/g, "")}`} tabIndex={open ? 0 : -1} className="btn btn-outline w-full">
                <Phone className="h-4 w-4" />
                {phone}
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
