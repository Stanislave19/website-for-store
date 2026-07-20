"use client";

import { useEffect, useState } from "react";

import {
  AdminApiError,
  createAdminAttributeValue,
  deleteAdminAttributeValue,
  getAdminAttributeTypes,
  getAdminAttributeValues,
  updateAdminAttributeValue,
} from "@/lib/admin-api";
import type { AttributeTypeOut, AttributeValueOut } from "@/types/admin";

export default function AdminAttributeValuesPage() {
  const [attributeTypes, setAttributeTypes] = useState<AttributeTypeOut[]>([]);
  const [filterTypeId, setFilterTypeId] = useState<number | "">("");
  const [items, setItems] = useState<AttributeValueOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newTypeId, setNewTypeId] = useState<number | "">("");
  const [newValue, setNewValue] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    getAdminAttributeTypes().then(setAttributeTypes).catch(() => setAttributeTypes([]));
  }, []);

  function load(typeId: number | "") {
    setLoading(true);
    setError(null);
    getAdminAttributeValues(typeId === "" ? undefined : typeId)
      .then(setItems)
      .catch(() => setError("Не вдалося завантажити список"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load(filterTypeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterTypeId]);

  function typeName(id: number) {
    return attributeTypes.find((t) => t.id === id)?.name ?? "—";
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!newValue.trim() || newTypeId === "") return;
    setCreating(true);
    try {
      await createAdminAttributeValue({ attribute_type_id: newTypeId, value: newValue.trim() });
      setNewValue("");
      load(filterTypeId);
    } catch (err) {
      alert(err instanceof AdminApiError ? err.message : "Не вдалося створити значення");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(item: AttributeValueOut) {
    setEditingId(item.id);
    setEditingValue(item.value);
  }

  async function handleSaveEdit(id: number) {
    if (!editingValue.trim()) return;
    setSavingId(id);
    try {
      await updateAdminAttributeValue(id, { value: editingValue.trim() });
      setEditingId(null);
      load(filterTypeId);
    } catch (err) {
      alert(err instanceof AdminApiError ? err.message : "Не вдалося зберегти зміни");
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Видалити значення? Цю дію не можна скасувати.")) return;
    setDeletingId(id);
    try {
      await deleteAdminAttributeValue(id);
      load(filterTypeId);
    } catch (err) {
      alert(err instanceof AdminApiError ? err.message : "Не вдалося видалити");
    } finally {
      setDeletingId(null);
    }
  }

  const selectClass =
    "h-11 rounded-[3px] border border-edge px-3 font-sans text-[15px] text-ink outline-none focus:border-racing";

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-medium text-ink">Значення атрибутів</h1>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <label className="font-sans text-[13px] text-leather">Фільтр за типом:</label>
        <select
          value={filterTypeId}
          onChange={(event) =>
            setFilterTypeId(event.target.value === "" ? "" : Number(event.target.value))
          }
          className={selectClass}
        >
          <option value="">Усі типи</option>
          {attributeTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      <form onSubmit={handleCreate} className="mb-5 flex flex-wrap gap-3">
        <select
          value={newTypeId}
          onChange={(event) => setNewTypeId(event.target.value === "" ? "" : Number(event.target.value))}
          className={selectClass}
          required
        >
          <option value="">Оберіть тип атрибута</option>
          {attributeTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={newValue}
          onChange={(event) => setNewValue(event.target.value)}
          placeholder="Напр. Латунь"
          className="h-11 w-full max-w-xs rounded-[3px] border border-edge px-3 font-sans text-[15px] text-ink outline-none focus:border-racing"
        />
        <button
          type="submit"
          disabled={creating}
          className="rounded-[3px] bg-racing px-5 py-2.5 font-sans text-sm font-medium text-cream disabled:opacity-60"
        >
          Додати значення
        </button>
      </form>

      {error ? <p className="mb-4 font-sans text-sm text-error">{error}</p> : null}

      <div className="overflow-x-auto border border-edge bg-white">
        <table className="w-full font-sans text-sm">
          <thead>
            <tr className="border-b border-edge text-left text-leather">
              <th className="px-4 py-3 font-normal">Тип атрибута</th>
              <th className="px-4 py-3 font-normal">Значення</th>
              <th className="px-4 py-3 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-leather">
                  Завантаження…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-leather">
                  Нічого не знайдено
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-edge last:border-0">
                  <td className="px-4 py-3 text-leather">{typeName(item.attribute_type_id)}</td>
                  <td className="px-4 py-3 text-ink">
                    {editingId === item.id ? (
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(event) => setEditingValue(event.target.value)}
                        className="h-9 w-full max-w-xs rounded-[3px] border border-edge px-2 font-sans text-sm outline-none focus:border-racing"
                        autoFocus
                      />
                    ) : (
                      item.value
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
