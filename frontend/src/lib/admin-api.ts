import type {
  AdminCategory,
  AdminOrderDetail,
  AdminOrderListResponse,
  AdminProductDetail,
  AdminProductImage,
  AdminProductListResponse,
  AdminSession,
  AttributeTypeInput,
  AttributeTypeOut,
  AttributeValueInput,
  AttributeValueOut,
  BrandInput,
  BrandOut,
  CategoryInput,
  MechanismTypeInput,
  MechanismTypeOut,
  OrderStatus,
} from "@/types/admin";

const API_URL =
  typeof window === "undefined"
    ? (process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL)
    : process.env.NEXT_PUBLIC_API_URL;

export class AdminApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    cache: "no-store",
    headers: {
      ...(init.body && !(init.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  if (!res.ok) {
    let detail = "Помилка запиту";
    try {
      const body = await res.json();
      detail = typeof body.detail === "string" ? body.detail : detail;
    } catch {
      // ignore
    }
    throw new AdminApiError(res.status, detail);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export function adminLogin(email: string, password: string): Promise<AdminSession> {
  return adminFetch<AdminSession>("/admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function adminLogout(): Promise<void> {
  return adminFetch<void>("/admin/logout", { method: "POST" });
}

export function adminMe(): Promise<AdminSession> {
  return adminFetch<AdminSession>("/admin/me");
}

export function listAdminProducts(params: {
  search?: string;
  page?: number;
  page_size?: number;
}): Promise<AdminProductListResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", String(params.page));
  if (params.page_size) query.set("page_size", String(params.page_size));
  const qs = query.toString();
  return adminFetch<AdminProductListResponse>(`/admin/products${qs ? `?${qs}` : ""}`);
}

export function getAdminProduct(id: number): Promise<AdminProductDetail> {
  return adminFetch<AdminProductDetail>(`/admin/products/${id}`);
}

export function createAdminProduct(payload: Record<string, unknown>): Promise<AdminProductDetail> {
  return adminFetch<AdminProductDetail>("/admin/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdminProduct(
  id: number,
  payload: Record<string, unknown>,
): Promise<AdminProductDetail> {
  return adminFetch<AdminProductDetail>(`/admin/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteAdminProduct(id: number): Promise<void> {
  return adminFetch<void>(`/admin/products/${id}`, { method: "DELETE" });
}

export function uploadAdminProductImage(productId: number, file: File): Promise<AdminProductImage> {
  const formData = new FormData();
  formData.append("file", file);
  return adminFetch<AdminProductImage>(`/admin/products/${productId}/images`, {
    method: "POST",
    body: formData,
  });
}

export function deleteAdminProductImage(productId: number, imageId: number): Promise<void> {
  return adminFetch<void>(`/admin/products/${productId}/images/${imageId}`, { method: "DELETE" });
}

export function listAdminOrders(params: {
  status?: OrderStatus;
  page?: number;
  page_size?: number;
}): Promise<AdminOrderListResponse> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.page) query.set("page", String(params.page));
  if (params.page_size) query.set("page_size", String(params.page_size));
  const qs = query.toString();
  return adminFetch<AdminOrderListResponse>(`/admin/orders${qs ? `?${qs}` : ""}`);
}

export function getAdminOrder(id: number): Promise<AdminOrderDetail> {
  return adminFetch<AdminOrderDetail>(`/admin/orders/${id}`);
}

export function updateAdminOrderStatus(id: number, status: OrderStatus): Promise<AdminOrderDetail> {
  return adminFetch<AdminOrderDetail>(`/admin/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function listAdminCategories(): Promise<AdminCategory[]> {
  return adminFetch<AdminCategory[]>("/admin/categories");
}

export function createAdminCategory(payload: CategoryInput): Promise<AdminCategory> {
  return adminFetch<AdminCategory>("/admin/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdminCategory(
  id: number,
  payload: Partial<CategoryInput>,
): Promise<AdminCategory> {
  return adminFetch<AdminCategory>(`/admin/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteAdminCategory(id: number): Promise<void> {
  return adminFetch<void>(`/admin/categories/${id}`, { method: "DELETE" });
}

export function getAdminBrands(): Promise<BrandOut[]> {
  return adminFetch<BrandOut[]>("/admin/brands");
}

export function createAdminBrand(payload: BrandInput): Promise<BrandOut> {
  return adminFetch<BrandOut>("/admin/brands", { method: "POST", body: JSON.stringify(payload) });
}

export function updateAdminBrand(id: number, payload: BrandInput): Promise<BrandOut> {
  return adminFetch<BrandOut>(`/admin/brands/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteAdminBrand(id: number): Promise<void> {
  return adminFetch<void>(`/admin/brands/${id}`, { method: "DELETE" });
}

export function getAdminMechanismTypes(): Promise<MechanismTypeOut[]> {
  return adminFetch<MechanismTypeOut[]>("/admin/mechanism-types");
}

export function createAdminMechanismType(payload: MechanismTypeInput): Promise<MechanismTypeOut> {
  return adminFetch<MechanismTypeOut>("/admin/mechanism-types", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdminMechanismType(
  id: number,
  payload: MechanismTypeInput,
): Promise<MechanismTypeOut> {
  return adminFetch<MechanismTypeOut>(`/admin/mechanism-types/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteAdminMechanismType(id: number): Promise<void> {
  return adminFetch<void>(`/admin/mechanism-types/${id}`, { method: "DELETE" });
}

export function getAdminAttributeTypes(): Promise<AttributeTypeOut[]> {
  return adminFetch<AttributeTypeOut[]>("/admin/attribute-types");
}

export function createAdminAttributeType(payload: AttributeTypeInput): Promise<AttributeTypeOut> {
  return adminFetch<AttributeTypeOut>("/admin/attribute-types", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdminAttributeType(
  id: number,
  payload: AttributeTypeInput,
): Promise<AttributeTypeOut> {
  return adminFetch<AttributeTypeOut>(`/admin/attribute-types/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteAdminAttributeType(id: number): Promise<void> {
  return adminFetch<void>(`/admin/attribute-types/${id}`, { method: "DELETE" });
}

export function getAdminAttributeValues(attributeTypeId?: number): Promise<AttributeValueOut[]> {
  const qs = attributeTypeId ? `?attribute_type_id=${attributeTypeId}` : "";
  return adminFetch<AttributeValueOut[]>(`/admin/attribute-values${qs}`);
}

export function createAdminAttributeValue(payload: AttributeValueInput): Promise<AttributeValueOut> {
  return adminFetch<AttributeValueOut>("/admin/attribute-values", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdminAttributeValue(
  id: number,
  payload: Partial<AttributeValueInput>,
): Promise<AttributeValueOut> {
  return adminFetch<AttributeValueOut>(`/admin/attribute-values/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteAdminAttributeValue(id: number): Promise<void> {
  return adminFetch<void>(`/admin/attribute-values/${id}`, { method: "DELETE" });
}
