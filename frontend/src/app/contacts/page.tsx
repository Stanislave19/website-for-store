import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Контакти — LEROM Watch Co.",
  description: "Контакти LEROM Watch Co.: телефон, месенджери, адреса.",
};

export default function ContactsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 md:px-14">
      <h1 className="mb-8 font-serif text-4xl font-medium text-ink">Контакти</h1>

      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <Phone size={20} className="text-brass" />
          <a href="tel:+380441234567" className="font-sans text-[15px] text-ink">
            +380 44 123 4567
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Mail size={20} className="text-brass" />
          <a href="mailto:hello@lerom.watch" className="font-sans text-[15px] text-ink">
            hello@lerom.watch
          </a>
        </div>
        <div className="flex items-center gap-3">
          <MapPin size={20} className="text-brass" />
          <span className="font-sans text-[15px] text-ink">Київ, вул. Хрещатик 12</span>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <a
          href="https://t.me/lerom_manager"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-[3px] border border-edge px-6 py-3 font-sans text-sm text-ink"
        >
          Написати в Telegram
        </a>
        <a
          href="viber://chat"
          className="rounded-[3px] border border-edge px-6 py-3 font-sans text-sm text-ink"
        >
          Написати у Viber
        </a>
      </div>
    </main>
  );
}
