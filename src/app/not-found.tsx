import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { NotFoundContent } from "@/components/site/not-found-content";

export default function NotFound() {
  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="container-site flex h-[72px] items-center">
          <Link href="/" aria-label="Página inicial">
            <Logo />
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <NotFoundContent />
      </main>
    </>
  );
}
