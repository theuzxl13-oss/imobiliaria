import { WhatsAppIcon } from "./whatsapp-icon";

export function WhatsAppFloat({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="group fixed right-4 bottom-4 z-30 flex items-center gap-2 rounded-full bg-whatsapp p-3.5 text-white shadow-lg shadow-black/20 transition hover:scale-105 hover:bg-whatsapp-dark sm:right-6 sm:bottom-6"
    >
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-whatsapp/40 [animation-duration:2.5s]" />
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
