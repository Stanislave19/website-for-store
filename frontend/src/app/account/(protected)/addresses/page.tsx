"use client";

import { useEffect, useState } from "react";

import { AccountApiError, createAddress, deleteAddress, listAddresses } from "@/lib/account-api";
import type { AddressOut } from "@/types/account";
import type { DeliveryMethod } from "@/types/order";

const DELIVERY_OPTIONS: { value: DeliveryMethod; label: string }[] = [
  { value: "nova_poshta", label: "Нова Пошта" },
  { value: "ukrposhta", label: "Укрпошта" },
  { value: "courier", label: "Кур'єр" },
  { value: "pickup", label: "Самовивіз" },
];

const DELIVERY_METHOD_LABELS: Record<DeliveryMethod, string> = {
  nova_poshta: "Нова Пошта",
  ukrposhta: "Укрпошта",
  courier: "Кур'єр",
  pickup: "Самовивіз",
};

export default function AccountAddressesPage() {
  const [addresses, setAddresses] = useState<AddressOut[]>([]);
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [city, setCity] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("nova_poshta");
  const [npOffice, setNpOffice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    listAddresses()
      .then(setAddresses)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim() || !city.trim()) {
      setError("Заповніть ім'я, прізвище й місто");
      return;
    }
    if (deliveryMethod === "nova_poshta" && !npOffice.trim()) {
      setError("Вкажіть відділення Нової Пошти");
      return;
    }

    setSubmitting(true);
    try {
      const created = await createAddress({
        recipient_first_name: firstName.trim(),
        recipient_last_name: lastName.trim(),
        city: city.trim(),
        delivery_method: deliveryMethod,
        np_office: deliveryMethod === "nova_poshta" ? npOffice.trim() : undefined,
      });
      setAddresses((current) => [created, ...current]);
      setFirstName("");
      setLastName("");
      setCity("");
      setNpOffice("");
    } catch (err) {
      setError(err instanceof AccountApiError ? err.message : "Не вдалося додати адресу");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    await deleteAddress(id);
    setAddresses((current) => current.filter((address) => address.id !== id));
  }

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-medium text-ink">Збережені адреси</h1>

      {loading ? (
        <p className="font-sans text-sm text-leather">Завантаження…</p>
      ) : addresses.length === 0 ? (
        <p className="mb-6 font-sans text-sm text-leather">Адрес ще немає</p>
      ) : (
        <div className="mb-8 flex flex-col gap-3">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="flex flex-wrap items-center justify-between gap-3 border border-edge bg-white p-5"
            >
              <div className="font-sans text-sm text-ink">
                <p className="font-medium">
                  {address.recipient_first_name} {address.recipient_last_name}
                </p>
                <p className="text-leather">
                  {DELIVERY_METHOD_LABELS[address.delivery_method]}, {address.city}
                  {address.np_office ? `, ${address.np_office}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(address.id)}
                className="font-sans text-[13px] text-error hover:underline"
              >
                Видалити
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="border border-edge bg-white p-6">
        <h2 className="mb-4 font-serif text-lg font-medium text-ink">Додати адресу</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block font-sans text-[13px] text-leather">Ім&apos;я</label>
            <input
              type="text"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              className="h-11 w-full rounded-[3px] border border-edge px-3 font-sans text-[15px] text-ink outline-none focus:border-racing"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-sans text-[13px] text-leather">Прізвище</label>
            <input
              type="text"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              className="h-11 w-full rounded-[3px] border border-edge px-3 font-sans text-[15px] text-ink outline-none focus:border-racing"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-sans text-[13px] text-leather">Спосіб доставки</label>
            <select
              value={deliveryMethod}
              onChange={(event) => setDeliveryMethod(event.target.value as DeliveryMethod)}
              className="h-11 w-full rounded-[3px] border border-edge px-3 font-sans text-[15px] text-ink outline-none focus:border-racing"
            >
              {DELIVERY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block font-sans text-[13px] text-leather">Місто</label>
            <input
              type="text"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className="h-11 w-full rounded-[3px] border border-edge px-3 font-sans text-[15px] text-ink outline-none focus:border-racing"
            />
          </div>
          {deliveryMethod === "nova_poshta" ? (
            <div className="sm:col-span-2">
              <label className="mb-1.5 block font-sans text-[13px] text-leather">Відділення</label>
              <input
                type="text"
                value={npOffice}
                onChange={(event) => setNpOffice(event.target.value)}
                className="h-11 w-full rounded-[3px] border border-edge px-3 font-sans text-[15px] text-ink outline-none focus:border-racing"
              />
            </div>
          ) : null}
        </div>

        {error ? <p className="mt-4 font-sans text-sm text-error">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 rounded-[3px] bg-racing px-6 py-3 font-sans text-sm font-medium text-cream disabled:opacity-60"
        >
          {submitting ? "Додаємо…" : "Додати адресу"}
        </button>
      </form>
    </div>
  );
}
