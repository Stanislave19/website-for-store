"use client";

import NameReferenceManager from "@/components/admin/NameReferenceManager";
import { createAdminBrand, deleteAdminBrand, getAdminBrands, updateAdminBrand } from "@/lib/admin-api";

export default function AdminBrandsPage() {
  return (
    <NameReferenceManager
      title="Бренди"
      addLabel="Додати бренд"
      namePlaceholder="Назва бренду"
      list={getAdminBrands}
      create={createAdminBrand}
      update={updateAdminBrand}
      remove={deleteAdminBrand}
    />
  );
}
