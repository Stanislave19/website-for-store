import type { Metadata } from "next";

import { TrustBadges } from "@/components/ui/TrustBadges";

export const metadata: Metadata = {
  title: "Про нас — LEROM Watch Co.",
  description: "LEROM Watch Co. — годинники, що переживуть моду. Класика без зайвого галасу.",
};

export default function AboutPage() {
  return (
    <main>
      <div className="mx-auto max-w-3xl px-6 py-16 md:px-14">
        <h1 className="mb-6 font-serif text-4xl font-medium text-ink">Про нас</h1>
        <div className="flex flex-col gap-5 font-sans text-[15px] leading-relaxed text-leather">
          <p>
            LEROM Watch Co. — магазин наручних годинників для тих, хто цінує стриману
            впевненість, а не швидкоплинні тренди. Ми віримо, що добрий годинник — це річ на
            десятиліття, а не на сезон.
          </p>
          <p>
            Кожна модель у каталозі проходить відбір за якістю механізму, матеріалів і
            довговічністю дизайну. Ми не женемось за кількістю — ми обираємо моделі, які
            залишаються актуальними роками і передаються у спадок.
          </p>
          <p>
            Працюємо без власного складу: кожен годинник замовляється під ваше замовлення, тому
            асортимент завжди можна розширювати новими моделями. Менеджер зв&apos;яжеться з вами
            особисто, щоб узгодити деталі доставки та оплати.
          </p>
        </div>
      </div>
      <TrustBadges />
    </main>
  );
}
