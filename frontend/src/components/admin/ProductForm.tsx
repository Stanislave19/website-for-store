"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  createAdminProduct,
  getAdminAttributeTypes,
  getAdminAttributeValues,
  getAdminBrands,
  getAdminMechanismTypes,
  updateAdminProduct,
  AdminApiError,
} from "@/lib/admin-api";
import { getCategories } from "@/lib/api";
import type {
  AdminProductDetail,
  AttributeTypeOut,
  AttributeValueOut,
  BrandOut,
  MechanismTypeOut,
} from "@/types/admin";
import type { CategoryNode, Gender } from "@/types/catalog";

interface FlatCategory {
  id: number;
  name: string;
  depth: number;
}

function flattenCategories(nodes: CategoryNode[], depth = 0): FlatCategory[] {
  return nodes.flatMap((node) => [
    { id: node.id, name: node.name, depth },
    ...flattenCategories(node.children, depth + 1),
  ]);
}

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "Чоловічі" },
  { value: "female", label: "Жіночі" },
  { value: "unisex", label: "Унісекс" },
];

interface ProductFormProps {
  product?: AdminProductDetail;
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [categories, setCategories] = useState<FlatCategory[]>([]);
  const [brands, setBrands] = useState<BrandOut[]>([]);
  const [mechanismTypes, setMechanismTypes] = useState<MechanismTypeOut[]>([]);
  const [attributeTypes, setAttributeTypes] = useState<AttributeTypeOut[]>([]);
  const [attributeValues, setAttributeValues] = useState<AttributeValueOut[]>([]);
  const [loadingReferences, setLoadingReferences] = useState(true);

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [oldPrice, setOldPrice] = useState(product?.old_price ? String(product.old_price) : "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [categoryId, setCategoryId] = useState(product ? String(product.category_id) : "");
  const [brandId, setBrandId] = useState(product ? String(product.brand_id) : "");
  const [mechanismTypeId, setMechanismTypeId] = useState(product ? String(product.mechanism_type_id) : "");
  const [gender, setGender] = useState<Gender>(product?.gender ?? "male");
  const [caseDiameterMm, setCaseDiameterMm] = useState(product?.case_diameter_mm ? String(product.case_diameter_mm) : "");
  const [caseThicknessMm, setCaseThicknessMm] = useState(
    product?.case_thickness_mm ? String(product.case_thickness_mm) : "",
  );
  const [warrantyMonths, setWarrantyMonths] = useState(
    product?.warranty_months ? String(product.warranty_months) : "",
  );
  const [packageContents, setPackageContents] = useState(product?.package_contents ?? "");
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [selectedAttributeIds, setSelectedAttributeIds] = useState<number[]>(
    product?.attribute_value_ids ?? [],
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getCategories(),
      getAdminBrands(),
      getAdminMechanismTypes(),
      getAdminAttributeTypes(),
      getAdminAttributeValues(),
    ])
      .then(([categoryTree, brandList, mechanismList, attrTypes, attrValues]) => {
        setCategories(flattenCategories(categoryTree));
        setBrands(brandList);
        setMechanismTypes(mechanismList);
        setAttributeTypes(attrTypes);
        setAttributeValues(attrValues);
      })
      .finally(() => setLoadingReferences(false));
  }, []);

  function toggleAttribute(id: number) {
    setSelectedAttributeIds((current) =>
      current.includes(id) ? current.filter((v) => v !== id) : [...current, id],
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      price: Number(price),
      old_price: oldPrice.trim() ? Number(oldPrice) : null,
      sku: sku.trim(),
      category_id: Number(categoryId),
      brand_id: Number(brandId),
      mechanism_type_id: Number(mechanismTypeId),
      gender,
      case_diameter_mm: caseDiameterMm.trim() ? Number(caseDiameterMm) : null,
      case_thickness_mm: caseThicknessMm.trim() ? Number(caseThicknessMm) : null,
      warranty_months: warrantyMonths.trim() ? Number(warrantyMonths) : null,
      package_contents: packageContents.trim() || null,
      is_active: isActive,
      attribute_value_ids: selectedAttributeIds,
    };

    setSubmitting(true);
    try {
      if (isEdit && product) {
        await updateAdminProduct(product.id, payload);
        router.push("/admin/products");
      } else {
        const created = await createAdminProduct(payload);
        router.push(`/admin/products/${created.id}/edit`);
      }
      router.refresh();
    } catch (err) {
      if (err instanceof AdminApiError) {
        setError(err.message);
      } else {
        setError("Не вдалося зберегти товар. Перевірте поля й спробуйте ще раз.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingReferences) {
    return <p className="font-sans text-sm text-leather">Завантаження…</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <section className="border border-edge bg-white p-6">
        <h2 className="mb-4 font-serif text-lg font-medium text-ink">Основне</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Назва" required>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Артикул (SKU)" required>
            <input
              type="text"
              required
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Ціна, ₴" required>
            <input
              type="number"
              required
              min={0}
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Стара ціна, ₴ (якщо знижка)">
            <input
              type="number"
              min={0}
              step="0.01"
              value={oldPrice}
              onChange={(e) => setOldPrice(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Опис">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-[3px] border border-edge px-3 py-2.5 font-sans text-[15px] text-ink outline-none focus:border-racing"
            />
          </Field>
        </div>
        <label className="mt-4 flex items-center gap-2 font-sans text-[15px] text-ink">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 accent-racing"
          />
          Показувати в каталозі (активний)
        </label>
      </section>

      <section className="border border-edge bg-white p-6">
        <h2 className="mb-4 font-serif text-lg font-medium text-ink">Класифікація</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Категорія" required>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={inputClass}
            >
              <option value="" disabled>
                Оберіть категорію
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {"  ".repeat(cat.depth)}
                  {cat.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Бренд" required>
            <select
              required
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className={inputClass}
            >
              <option value="" disabled>
                Оберіть бренд
              </option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Тип механізму" required>
            <select
              required
              value={mechanismTypeId}
              onChange={(e) => setMechanismTypeId(e.target.value)}
              className={inputClass}
            >
              <option value="" disabled>
                Оберіть тип механізму
              </option>
              {mechanismTypes.map((mechanism) => (
                <option key={mechanism.id} value={mechanism.id}>
                  {mechanism.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Стать" required>
            <select
              required
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
              className={inputClass}
            >
              {GENDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <section className="border border-edge bg-white p-6">
        <h2 className="mb-4 font-serif text-lg font-medium text-ink">Характеристики</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Діаметр корпусу, мм">
            <input
              type="number"
              min={0}
              value={caseDiameterMm}
              onChange={(e) => setCaseDiameterMm(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Товщина корпусу, мм">
            <input
              type="number"
              min={0}
              value={caseThicknessMm}
              onChange={(e) => setCaseThicknessMm(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Гарантія, місяців">
            <input
              type="number"
              min={0}
              value={warrantyMonths}
              onChange={(e) => setWarrantyMonths(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Комплектація">
            <input
              type="text"
              value={packageContents}
              onChange={(e) => setPackageContents(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        {attributeTypes.length > 0 ? (
          <div className="mt-6 flex flex-col gap-5">
            {attributeTypes.map((attributeType) => {
              const values = attributeValues.filter((v) => v.attribute_type_id === attributeType.id);
              if (values.length === 0) return null;
              return (
                <div key={attributeType.id}>
                  <span className="mb-2 block font-sans text-[13px] font-medium text-leather">
                    {attributeType.name}
                  </span>
                  <div className="flex flex-wrap gap-4">
                    {values.map((value) => (
                      <label
                        key={value.id}
                        className="flex items-center gap-1.5 font-sans text-sm text-ink"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAttributeIds.includes(value.id)}
                          onChange={() => toggleAttribute(value.id)}
                          className="h-4 w-4 accent-racing"
                        />
                        {value.value}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </section>

      {error ? (
        <p className="border border-error/30 bg-error/5 px-4 py-3 font-sans text-sm text-error">{error}</p>
      ) : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-[3px] bg-racing px-6 py-3 font-sans text-sm font-medium text-cream disabled:opacity-60"
        >
          {submitting ? "Зберігаємо…" : isEdit ? "Зберегти зміни" : "Створити товар"}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "h-11 w-full rounded-[3px] border border-edge px-3 font-sans text-[15px] text-ink outline-none focus:border-racing";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block font-sans text-[13px] text-leather">
        {label} {required ? <span className="text-brass">*</span> : null}
      </label>
      {children}
    </div>
  );
}
