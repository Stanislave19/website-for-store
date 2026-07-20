"use client";

import { useEffect, useState } from "react";

import {
  AdminApiError,
  createAdminCategory,
  deleteAdminCategory,
  listAdminCategories,
  updateAdminCategory,
} from "@/lib/admin-api";
import type { AdminCategory } from "@/types/admin";

interface TreeRow {
  category: AdminCategory;
  depth: number;
}

function buildTree(items: AdminCategory[]): TreeRow[] {
  const byParent = new Map<number | null, AdminCategory[]>();
  for (const item of items) {
    const key = item.parent_id;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(item);
  }
  const rows: TreeRow[] = [];
  function walk(parentId: number | null, depth: number) {
    const children = byParent.get(parentId) ?? [];
    for (const child of children) {
      rows.push({ category: child, depth });
      walk(child.id, depth + 1);
    }
  }
  walk(null, 0);
  return rows;
}

const inputClass =
  "h-11 rounded-[3px] border border-edge px-3 font-sans text-[15px] text-ink outline-none focus:border-racing";

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newParentId, setNewParentId] = useState<number | "">("");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingParentId, setEditingParentId] = useState<number | "">("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    listAdminCategories()
      .then(setItems)
      .catch(() => setError("Не вдалося завантажити категорії"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const tree = buildTree(items);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await createAdminCategory({ name: newName.trim(), parent_id: newParentId === "" ? null : newParentId });
      setNewName("");
      setNewParentId("");
      load();
    } catch (err) {
      alert(err instanceof AdminApiError ? err.message : "Не вдалося створити категорію");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(category: AdminCategory) {
    setEditingId(category.id);
    setEditingName(category.name);
    setEditingParentId(category.parent_id ?? "");
  }

  async function handleSaveEdit(id: number) {
    if (!editingName.trim()) return;
    setSavingId(id);
    try {
      await updateAdminCategory(id, {
        name: editingName.trim(),
        parent_id: editingParentId === "" ? null : editingParentId,
      });
      setEditingId(null);
      load();
    } catch (err) {
      alert(err instanceof AdminApiError ? err.message : "Не вдалося зберегти зміни");
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Видалити категорію? Цю дію не можна скасувати.")) return;
    setDeletingId(id);
    try {
      await deleteAdminCategory(id);
      load();
    } catch (err) {
      alert(err instanceof AdminApiError ? err.message : "Не вдалося видалити категорію");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-medium text-ink">Категорії</h1>

      <form onSubmit={handleCreate} className="mb-5 flex flex-wrap gap-3">
        <input
          type="text"
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="Назва категорії"
          className={`${inputClass} w-full max-w-xs`}
        />
        <select
          value={newParentId}
          onChange={(event) => setNewParentId(event.target.value === "" ? "" : Number(event.target.value))}
          className={inputClass}
        >
          <option value="">— без батьківської —</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={creating}
          className="rounded-[3px] bg-racing px-5 py-2.5 font-sans text-sm font-medium text-cream disabled:opacity-60"
        >
          Додати категорію
        </button>
      </form>

      {error ? <p className="mb-4 font-sans text-sm text-error">{error}</p> : null}

      <div className="overflow-x-auto border border-edge bg-white">
        <table className="w-full font-sans text-sm">
          <thead>
            <tr className="border-b border-edge text-left text-leather">
              <th className="px-4 py-3 font-normal">Назва</th>
              <th className="px-4 py-3 font-normal">Slug</th>
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
            ) : tree.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-leather">
                  Категорій ще немає
                </td>
              </tr>
            ) : (
              tree.map(({ category, depth }) => (
                <tr key={category.id} className="border-b border-edge last:border-0">
                  <td className="px-4 py-3 text-ink" style={{ paddingLeft: `${16 + depth * 20}px` }}>
                    {editingId === category.id ? (
                      <div className="flex flex-wrap gap-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(event) => setEditingName(event.target.value)}
                          className="h-9 rounded-[3px] border border-edge px-2 font-sans text-sm outline-none focus:border-racing"
                          autoFocus
                        />
                        <select
                          value={editingParentId}
                          onChange={(event) =>
                            setEditingParentId(event.target.value === "" ? "" : Number(event.target.value))
                          }
                          className="h-9 rounded-[3px] border border-edge px-2 font-sans text-sm outline-none focus:border-racing"
                        >
                          <option value="">— без батьківської —</option>
                          {items
                            .filter((item) => item.id !== category.id)
                            .map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    ) : (
                      category.name
                    )}
                  </td>
                  <td className="px-4 py-3 text-leather">{category.slug}</td>
                  <td className="px-4 py-3 text-right">
                    {editingId === category.id ? (
                      <>
                        <button
                          type="button"
                          disabled={savingId === category.id}
                          onClick={() => handleSaveEdit(category.id)}
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
                          onClick={() => startEdit(category)}
                          className="mr-3 font-sans text-[13px] text-racing hover:underline"
                        >
                          Редагувати
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === category.id}
                          onClick={() => handleDelete(category.id)}
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
