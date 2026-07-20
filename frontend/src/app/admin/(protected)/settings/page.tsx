"use client";

import { useEffect, useState } from "react";

import { useAdminSession } from "../layout";
import { AdminApiError, listAdminSettings, updateAdminSettings } from "@/lib/admin-api";

const SETTING_FIELDS: { key: string; label: string; placeholder: string }[] = [
  { key: "instagram_url", label: "Instagram", placeholder: "https://instagram.com/..." },
  { key: "facebook_url", label: "Facebook", placeholder: "https://facebook.com/..." },
  { key: "telegram_manager", label: "Telegram менеджера", placeholder: "https://t.me/..." },
  { key: "viber_manager", label: "Viber менеджера", placeholder: "viber://chat?number=..." },
];

const inputClass =
  "h-11 w-full rounded-[3px] border border-edge px-3 font-sans text-[15px] text-ink outline-none focus:border-racing";

export default function AdminSettingsPage() {
  const session = useAdminSession();

  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (session && session.role !== "owner") return;
    listAdminSettings()
      .then((settings) => {
        const map: Record<string, string> = {};
        for (const setting of settings) map[setting.key] = setting.value;
        setValues(map);
      })
      .catch(() => setError("Не вдалося завантажити налаштування"))
      .finally(() => setLoading(false));
  }, [session]);

  if (session && session.role !== "owner") {
    return <p className="font-sans text-sm text-error">Немає доступу — розділ лише для власника.</p>;
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateAdminSettings(values);
      setSaved(true);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Не вдалося зберегти налаштування");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="font-sans text-sm text-leather">Завантаження…</p>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 font-serif text-2xl font-medium text-ink">Налаштування</h1>

      <form onSubmit={handleSave} className="flex flex-col gap-4 border border-edge bg-white p-6">
        {SETTING_FIELDS.map((field) => (
          <div key={field.key}>
            <label className="mb-1.5 block font-sans text-[13px] text-leather">{field.label}</label>
            <input
              type="text"
              value={values[field.key] ?? ""}
              onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}
              placeholder={field.placeholder}
              className={inputClass}
            />
          </div>
        ))}

        {error ? <p className="font-sans text-sm text-error">{error}</p> : null}
        {saved ? <p className="font-sans text-sm text-racing">Збережено.</p> : null}

        <div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-[3px] bg-racing px-6 py-3 font-sans text-sm font-medium text-cream disabled:opacity-60"
          >
            {saving ? "Зберігаємо…" : "Зберегти"}
          </button>
        </div>
      </form>
    </div>
  );
}
