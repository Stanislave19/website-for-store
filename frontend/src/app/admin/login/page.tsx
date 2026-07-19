"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { adminLogin, AdminApiError } from "@/lib/admin-api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await adminLogin(email.trim(), password);
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      if (err instanceof AdminApiError) {
        setError(err.message);
      } else {
        setError("Не вдалося увійти. Перевірте з'єднання й спробуйте ще раз.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm border border-edge bg-white p-8"
      >
        <h1 className="mb-1 font-serif text-2xl font-medium text-ink">LEROM Admin</h1>
        <p className="mb-6 font-sans text-sm text-leather">Вхід для персоналу</p>

        <label className="mb-1.5 block font-sans text-[13px] text-leather">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mb-4 h-11 w-full rounded-[3px] border border-edge px-3 font-sans text-[15px] text-ink outline-none focus:border-racing"
        />

        <label className="mb-1.5 block font-sans text-[13px] text-leather">Пароль</label>
        <input
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mb-5 h-11 w-full rounded-[3px] border border-edge px-3 font-sans text-[15px] text-ink outline-none focus:border-racing"
        />

        {error ? <p className="mb-4 font-sans text-sm text-error">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="h-11 w-full rounded-[3px] bg-racing font-sans text-sm font-medium text-cream disabled:opacity-60"
        >
          {submitting ? "Входимо…" : "Увійти"}
        </button>
      </form>
    </main>
  );
}
