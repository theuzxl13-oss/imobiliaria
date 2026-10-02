import Image from "next/image";
import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={cn("h-10 w-10 shrink-0", className)}>
      <rect width="64" height="64" rx="14" fill="#0a0908" />
      <path
        d="M12 31 32 14l20 17"
        fill="none"
        stroke="#f97316"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M22 30h20M32 30v20" fill="none" stroke="#fff" strokeWidth="5.5" strokeLinecap="round" />
    </svg>
  );
}

/** Logotipo: usa a imagem enviada no painel ou o logotipo padrão. */
export function Logo({
  name = "Toninho Imóveis",
  logoUrl,
  variant = "dark",
  className,
}: {
  name?: string;
  logoUrl?: string | null;
  variant?: "dark" | "light";
  className?: string;
}) {
  if (logoUrl) {
    return (
      <span className={cn("relative block h-11 w-40", className)}>
        <Image src={logoUrl} alt={name} fill sizes="160px" className="object-contain object-left" priority />
      </span>
    );
  }

  const [first, ...rest] = name.split(" ");
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className={variant === "light" ? "ring-1 ring-white/20 rounded-[14px]" : undefined} />
      <span className="leading-none">
        <span
          className={cn(
            "block text-lg font-extrabold tracking-tight",
            variant === "light" ? "text-white" : "text-brand-950",
          )}
        >
          {first.toUpperCase()}
        </span>
        <span
          className={cn(
            "block text-[0.68rem] font-bold tracking-[0.32em]",
            variant === "light" ? "text-gold-300" : "text-gold-600",
          )}
        >
          {(rest.join(" ") || "IMÓVEIS").toUpperCase()}
        </span>
      </span>
    </span>
  );
}
