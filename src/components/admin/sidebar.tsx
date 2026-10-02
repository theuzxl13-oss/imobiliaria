"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ExternalLink,
  Home,
  Inbox,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Megaphone,
  Menu,
  Plus,
  Settings,
  Users,
  X,
} from "lucide-react";
import { Logo } from "@/components/site/logo";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/imoveis", label: "Gerenciar imóveis", icon: Home },
  { href: "/admin/imoveis/novo", label: "Cadastrar imóvel", icon: Plus, exact: true },
  { href: "/admin/interessados", label: "Interessados", icon: Inbox, badge: "leads" as const },
  { href: "/admin/solicitacoes", label: "Anuncie seu imóvel", icon: Megaphone, badge: "requests" as const },
  { href: "/admin/caracteristicas", label: "Características e categorias", icon: ListChecks },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
];

export function AdminSidebar({
  userName,
  userEmail,
  counts,
}: {
  userName: string;
  userEmail: string;
  counts: { leads: number; requests: number };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact
      ? pathname === href
      : pathname === href || (pathname.startsWith(`${href}/`) && !pathname.startsWith("/admin/imoveis/novo"));

  const nav = (
    <nav className="flex-1 space-y-1 overflow-y-auto p-3">
      {NAV.map(({ href, label, icon: Icon, exact, badge }) => {
        const active = isActive(href, exact);
        const count = badge ? counts[badge] : 0;
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
              active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon className={cn("h-5 w-5", active ? "text-gold-300" : "text-slate-400")} />
            <span className="flex-1">{label}</span>
            {count > 0 && (
              <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white">{count}</span>
            )}
          </Link>
        );
      })}
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
      >
        <ExternalLink className="h-5 w-5 text-slate-400" />
        Ver site
      </a>
    </nav>
  );

  const footer = (
    <div className="border-t border-white/10 p-4">
      <p className="truncate text-sm font-semibold text-white">{userName}</p>
      <p className="truncate text-xs text-slate-400">{userEmail}</p>
      <form action={signOut}>
        <button type="submit" className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white">
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </form>
    </div>
  );

  return (
    <>
      {/* Barra superior mobile */}
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between bg-brand-950 px-4 lg:hidden">
        <Link href="/admin">
          <Logo variant="light" />
        </Link>
        <button type="button" onClick={() => setOpen(true)} className="rounded-lg p-2 text-white" aria-label="Abrir menu">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col bg-brand-950 lg:flex">
        <div className="flex h-20 items-center px-6">
          <Link href="/admin">
            <Logo variant="light" />
          </Link>
        </div>
        {nav}
        {footer}
      </aside>

      <div className={cn("fixed inset-0 z-50 lg:hidden", open ? "" : "pointer-events-none")} aria-hidden={!open}>
        <div
          className={cn("absolute inset-0 bg-black/50 transition-opacity", open ? "opacity-100" : "opacity-0")}
          onClick={() => setOpen(false)}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 flex w-72 flex-col bg-brand-950 transition-transform",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-16 items-center justify-between px-4">
            <Logo variant="light" />
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-white" aria-label="Fechar menu">
              <X className="h-6 w-6" />
            </button>
          </div>
          {nav}
          {footer}
        </aside>
      </div>
    </>
  );
}
