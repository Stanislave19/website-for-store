"use client";

import NameReferenceManager from "@/components/admin/NameReferenceManager";
import {
  createAdminMechanismType,
  deleteAdminMechanismType,
  getAdminMechanismTypes,
  updateAdminMechanismType,
} from "@/lib/admin-api";

export default function AdminMechanismTypesPage() {
  return (
    <NameReferenceManager
      title="Типи механізму"
      addLabel="Додати тип"
      namePlaceholder="Напр. Кварц"
      list={getAdminMechanismTypes}
      create={createAdminMechanismType}
      update={updateAdminMechanismType}
      remove={deleteAdminMechanismType}
    />
  );
}
