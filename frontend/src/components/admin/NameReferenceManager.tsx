"use client";

import { useEffect, useState } from "react";

import { AdminApiError } from "@/lib/admin-api";

interface NamedEntity {
  id: number;
  name: string;
}

interface NameReferenceManagerProps {
  title: string;
  addLabel: string;
  namePlaceholder: string;
  list: () => Promise<NamedEntity[]>;
  create: (payload: { name: string }) => Promise<NamedEntity>;
  update: (id: number, payload: { name: string }) => Promise<NamedEntity>;
  remove: (id: number) => Promise<void>;
}

export default function NameReferenceManager({
  title,
  addLabel,
  namePlaceholder,
  list,
  create,
  update,
  remove,
}: NameReferenceManagerProps) {
  const [items, setItems] = useState<NamedEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    list()
      .then(setItems)
      .catch(() => setError("Не вдалося завантажити список"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await create({ name: newName.trim() });
      setNewName("");
      load();
    } catch (err) {
      alert(err instanceof AdminApiError ? err.message : "Не вдалося створити запис");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(item: NamedEntity) {
    setEditingId(item.id);
    setEditingName(item.name);
  }

  async function handleSaveEdit(id: number) {
    if (!editingName.trim()) return;
    setSavingId(id);
    try {
      await update(id, { name: editingName.trim() });
      setEditingId(null);
      load();
    } catch (err) {
      alert(err instanceof AdminApiError ? err.message : "Не вдалося зберегти зміни");
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Видалити? Цю дію не можна скасувати.")) return;
    setDeletingId(id);
    try {
      await remove(id);
      load();
    } catch (err) {
      alert(err instanceof AdminApiError ? err.message : "Не вдалося видалити");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-medium text-ink">{title}</h1>

      <form onSubmit={handleCreate} className="mb-5 flex gap-3">
        <input
          type="text"
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder={namePlaceholder}
          className="h-11 w-full max-w-sm rounded-[3px] border border-edge px-3 font-sans text-[15px] text-ink outline-none focus:border-racing"
        />
        <button
          type="submit"
          disabled={creating}
          className="rounded-[3px] bg-racing px-5 py-2.5 font-sans text-sm font-medium text-cream disabled:opacity-60"
        >
          {addLabel}
        </button>
      </form>

      {error ? <p className="mb-4 font-sans text-sm text-error">{error}</p> : null}

      <div className="overflow-x-auto border border-edge bg-white">
        <table className="w-full font-sans text-sm">
          <thead>
            <tr className="border-b border-edge text-left text-leather">
              <th className="px-4 py-3 font-normal">Назва</th>
              <th className="px-4 py-3 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-center text-leather">
                  Завантаження…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-center text-leather">
                  Нічого не знайдено
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-edge last:border-0">
                  <td className="px-4 py-3 text-ink">
                    {editingId === item.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                        className="h-9 w-full max-w-xs rounded-[3px] border border-edge px-2 font-sans text-sm outline-none focus:border-racing"
                        autoFocus
                      />
                    ) : (
                      item.name
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editingId === item.id ? (
                      <>
                        <button
                          type="button"
                          disabled={savingId === item.id}
                          onClick={() => handleSaveEdit(item.id)}
                          className="mr-3 font-sans text-[13px] text-racing hover:underline disabled:opacity-60"
                        >
                          Зберегти
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="font-sans text-[13px] text-leather hover:underline"
                        >
                          Скасувати
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          className="mr-3 font-sans text-[13px] text-racing hover:underline"
                        >
                          Редагувати
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === item.id}
                          onClick={() => handleDelete(item.id)}
                          className="font-sans text-[13px] text-error hover:underline disabled:opacity-60"
                        >
                          Видалити
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
