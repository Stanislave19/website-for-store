"use client";

import NameReferenceManager from "@/components/admin/NameReferenceManager";
import {
  createAdminAttributeType,
  deleteAdminAttributeType,
  getAdminAttributeTypes,
  updateAdminAttributeType,
} from "@/lib/admin-api";

export default function AdminAttributeTypesPage() {
  return (
    <NameReferenceManager
      title="Типи атрибутів"
      addLabel="Додати тип"
      namePlaceholder="Напр. Матеріал корпусу"
      list={getAdminAttributeTypes}
      create={createAdminAttributeType}
      update={updateAdminAttributeType}
      remove={deleteAdminAttributeType}
    />
  );
}
