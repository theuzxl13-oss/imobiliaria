import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export function PageHero({
  title,
  description,
  breadcrumb,
  children,
}: {
  title: string;
  description?: string;
  breadcrumb: { label: string; href?: string }[];
  children?: ReactNode;
}) {
  return (
    <section className="hero-pattern text-white">
      <div className="container-site py-10 sm:py-14">
        <nav aria-label="Você está em" className="mb-3 flex flex-wrap items-center gap-1 text-xs text-slate-300">
          <Link href="/" className="hover:text-white">Início</Link>
          {breadcrumb.map((b) => (
            <span key={b.label} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3" />
              {b.href ? <Link href={b.href} className="hover:text-white">{b.label}</Link> : <span className="text-white">{b.label}</span>}
            </span>
          ))}
        </nav>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-slate-300">{description}</p>}
        {children}
      </div>
    </section>
  );
}
