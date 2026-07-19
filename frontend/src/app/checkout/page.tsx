"use client";

import { Bike, Package, Store, Truck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CityAutocomplete } from "@/components/checkout/CityAutocomplete";
import { DeliveryMethodCard } from "@/components/checkout/DeliveryMethodCard";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { WarehouseAutocomplete } from "@/components/checkout/WarehouseAutocomplete";
import { useCart } from "@/hooks/useCart";
import { useCartProducts } from "@/hooks/useCartProducts";
import { usePromoCode } from "@/hooks/usePromoCode";
import { createOrder, OrderApiError } from "@/lib/api";
import { isValidPhoneDigits, toFullPhone } from "@/lib/validators";
import type { City, Warehouse } from "@/types/delivery";
import type { ContactMethod, DeliveryMethod } from "@/types/order";

const DELIVERY_OPTIONS: { value: DeliveryMethod; label: string; icon: typeof Truck }[] = [
  { value: "nova_poshta", label: "Нова Пошта", icon: Truck },
  { value: "ukrposhta", label: "Укрпошта", icon: Package },
  { value: "courier", label: "Кур'єр", icon: Bike },
  { value: "pickup", label: "Самовивіз", icon: Store },
];

const CONTACT_OPTIONS: { value: ContactMethod; label: string }[] = [
  { value: "call", label: "Дзвінок" },
  { value: "telegram", label: "Telegram" },
  { value: "viber", label: "Viber" },
];

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  city?: string;
  npOffice?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { clear } = useCart();
  const { items, products, loading, itemsTotal } = useCartProducts();
  const {
    code: promoCode,
    setCode: setPromoCode,
    error: promoError,
    promo,
    applying: applyingPromo,
    apply: applyPromo,
    discountAmount,
    appliedCode,
  } = usePromoCode(itemsTotal);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("nova_poshta");
  const [city, setCity] = useState("");
  const [cityRef, setCityRef] = useState<string | undefined>(undefined);
  const [npOffice, setNpOffice] = useState("");
  const [warehouseRef, setWarehouseRef] = useState<string | undefined>(undefined);
  const [contactMethod, setContactMethod] = useState<ContactMethod>("call");
  const [comment, setComment] = useState("");

  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const needsCity = deliveryMethod !== "pickup";
  const needsNpOffice = deliveryMethod === "nova_poshta";
  const useNovaPoshtaAutocomplete = deliveryMethod === "nova_poshta";

  function handleCityTextChange(value: string) {
    setCity(value);
    setCityRef(undefined);
    setNpOffice("");
    setWarehouseRef(undefined);
  }

  function handleSelectCity(selected: City) {
    setCity(selected.name);
    setCityRef(selected.ref);
    setNpOffice("");
    setWarehouseRef(undefined);
  }

  function handleNpOfficeTextChange(value: string) {
    setNpOffice(value);
    setWarehouseRef(undefined);
  }

  function handleSelectWarehouse(selected: Warehouse) {
    setNpOffice(selected.description);
    setWarehouseRef(selected.ref);
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!firstName.trim()) next.firstName = "Вкажіть ім'я";
    if (!lastName.trim()) next.lastName = "Вкажіть прізвище";
    if (!isValidPhoneDigits(phoneDigits)) next.phone = "Телефон має бути у форматі +380XXXXXXXXX";
    if (needsCity && !city.trim()) next.city = "Вкажіть місто";
    if (needsNpOffice && !npOffice.trim()) next.npOffice = "Вкажіть відділення";
    return next;
  }

  const canSubmit = !loading && items.length > 0;

  async function handleSubmit() {
    const fieldErrors = validate();
    setErrors(fieldErrors);
    setSubmitError(null);
    if (Object.keys(fieldErrors).length > 0) return;

    setSubmitting(true);
    try {
      const response = await createOrder({
        items: items.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: toFullPhone(phoneDigits),
        delivery_method: deliveryMethod,
        city: needsCity ? city.trim() : undefined,
        city_ref: needsCity && useNovaPoshtaAutocomplete ? cityRef : undefined,
        np_office: needsNpOffice ? npOffice.trim() : undefined,
        warehouse_ref: needsNpOffice ? warehouseRef : undefined,
        contact_method: contactMethod,
        comment: comment.trim() || undefined,
        promo_code: appliedCode,
      });
      clear();
      router.push(`/order-success?order=${response.order_id}`);
    } catch (error) {
      if (error instanceof OrderApiError) {
        setSubmitError(error.message);
      } else {
        setSubmitError("Не вдалося оформити замовлення. Перевірте з'єднання й спробуйте ще раз.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!loading && items.length === 0) {
    return (
      <main className="w-full px-6 py-16 md:px-14">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-4 border border-edge bg-white px-8 py-16 text-center">
          <h1 className="font-serif text-2xl text-ink">Кошик порожній</h1>
          <p className="font-sans text-[15px] text-leather">
            Додайте товари в кошик, щоб оформити замовлення
          </p>
          <Link
            href="/catalog"
            className="mt-2 rounded-[3px] bg-racing px-8 py-3.5 font-sans text-sm font-medium text-cream"
          >
            Перейти до каталогу
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full px-6 py-10 md:px-14">
      <nav className="mb-6 font-sans text-[13px] text-leather">
        <Link href="/">Головна</Link>
        <span className="mx-2 text-edge">/</span>
        <Link href="/cart">Кошик</Link>
        <span className="mx-2 text-edge">/</span>
        <span className="text-ink">Оформлення</span>
      </nav>

      <h1 className="mb-8 font-serif text-[34px] font-medium text-ink">Оформлення замовлення</h1>

      <div className="flex flex-col gap-10 lg:flex-row">
        <div className="flex flex-1 flex-col gap-6">
          <section className="border border-edge bg-white p-7">
            <h2 className="mb-5 font-serif text-xl font-medium text-ink">Контактні дані</h2>
            <div className="flex flex-col gap-4">
              <Field label="Ім'я" required error={errors.firstName}>
                <input
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="Ваше ім'я"
                  className={inputClass(Boolean(errors.firstName))}
                />
              </Field>

              <Field label="Прізвище" required error={errors.lastName} hint="Потрібне для оформлення посилки Новою Поштою">
                <input
                  type="text"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Ваше прізвище"
                  className={inputClass(Boolean(errors.lastName))}
                />
              </Field>

              <Field label="Телефон" required error={errors.phone}>
                <div className="flex gap-2">
                  <span className="flex h-11 items-center rounded-[3px] border border-edge bg-white px-3 font-sans text-[15px] text-ink">
                    +380
                  </span>
                  <input
                    type="tel"
                    value={phoneDigits}
                    onChange={(event) => setPhoneDigits(event.target.value.replace(/\D/g, "").slice(0, 9))}
                    placeholder="00 000 0000"
                    className={inputClass(Boolean(errors.phone))}
                  />
                </div>
              </Field>
            </div>
          </section>

          <section className="border border-edge bg-white p-7">
            <h2 className="mb-5 font-serif text-xl font-medium text-ink">Доставка</h2>
            <div className="mb-4 grid grid-cols-2 gap-3">
              {DELIVERY_OPTIONS.map((option) => (
                <DeliveryMethodCard
                  key={option.value}
                  label={option.label}
                  icon={option.icon}
                  selected={deliveryMethod === option.value}
                  onSelect={() => setDeliveryMethod(option.value)}
                />
              ))}
            </div>

            {needsCity ? (
              <Field label="Місто" required error={errors.city}>
                {useNovaPoshtaAutocomplete ? (
                  <CityAutocomplete
                    value={city}
                    onChange={handleCityTextChange}
                    onSelectCity={handleSelectCity}
                    error={Boolean(errors.city)}
                  />
                ) : (
                  <input
                    type="text"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    placeholder="Ваше місто"
                    className={inputClass(Boolean(errors.city))}
                  />
                )}
              </Field>
            ) : null}

            {needsNpOffice ? (
              <div className="mt-4">
                <Field label="Відділення" required error={errors.npOffice}>
                  <WarehouseAutocomplete
                    value={npOffice}
                    onChange={handleNpOfficeTextChange}
                    onSelectWarehouse={handleSelectWarehouse}
                    cityRef={cityRef}
                    error={Boolean(errors.npOffice)}
                  />
                </Field>
              </div>
            ) : null}
          </section>

          <section className="border border-edge bg-white p-7">
            <h2 className="mb-5 font-serif text-xl font-medium text-ink">Зв'язок</h2>
            <div className="mb-4">
              <span className="mb-2 block font-sans text-[13px] text-leather">Зручний спосіб зв'язку</span>
              <div className="flex flex-wrap gap-5">
                {CONTACT_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 font-sans text-[15px] text-ink">
                    <input
                      type="radio"
                      name="contact_method"
                      checked={contactMethod === option.value}
                      onChange={() => setContactMethod(option.value)}
                      className="h-4 w-4 accent-racing"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <Field label="Коментар до замовлення">
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Необов'язково"
                rows={3}
                className="w-full rounded-[3px] border border-edge px-3 py-2.5 font-sans text-[15px] text-ink outline-none focus:border-racing"
              />
            </Field>
          </section>

          {submitError ? (
            <p className="border border-error/30 bg-error/5 px-4 py-3 font-sans text-sm text-error">
              {submitError}
            </p>
          ) : null}
        </div>

        <div className="lg:w-[35%]">
          <OrderSummary
            items={items}
            products={products}
            promoCode={promoCode}
            onPromoCodeChange={setPromoCode}
            promoError={promoError}
            promoApplied={Boolean(promo)}
            applyingPromo={applyingPromo}
            onApplyPromo={applyPromo}
            itemsTotal={itemsTotal}
            discountAmount={discountAmount}
            canSubmit={canSubmit}
            submitting={submitting}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </main>
  );
}

function inputClass(hasError: boolean): string {
  return `h-11 w-full rounded-[3px] border px-3 font-sans text-[15px] text-ink outline-none placeholder:text-leather ${
    hasError ? "border-error" : "border-edge focus:border-racing"
  }`;
}

function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block font-sans text-[13px] text-leather">
        {label} {required ? <span className="text-brass">*</span> : null}
      </label>
      {children}
      {hint && !error ? <p className="mt-1 font-sans text-xs text-leather">{hint}</p> : null}
      {error ? <p className="mt-1 font-sans text-xs text-error">{error}</p> : null}
    </div>
  );
}
