import type { Gender } from "./catalog";

export type StaffRole = "manager" | "owner";

export interface AdminSession {
  role: StaffRole;
}

export interface AdminProductImage {
  id: number;
  url: string;
  position: number;
}

export interface AdminProductListItem {
  id: number;
  slug: string;
  name: string;
  sku: string;
  price: number;
  is_active: boolean;
  brand: string;
  main_image: string | null;
}

export interface AdminProductListResponse {
  items: AdminProductListItem[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface AdminProductDetail {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  old_price: number | null;
  sku: string;
  category_id: number;
  brand_id: number;
  mechanism_type_id: number;
  gender: Gender;
  case_diameter_mm: number | null;
  case_thickness_mm: number | null;
  warranty_months: number | null;
  package_contents: string | null;
  is_active: boolean;
  created_at: string;
  images: AdminProductImage[];
  attribute_value_ids: number[];
}

export interface ProductFormValues {
  name: string;
  description: string;
  price: string;
  old_price: string;
  sku: string;
  category_id: string;
  brand_id: string;
  mechanism_type_id: string;
  gender: Gender;
  case_diameter_mm: string;
  case_thickness_mm: string;
  warranty_months: string;
  package_contents: string;
  is_active: boolean;
  attribute_value_ids: number[];
}

export interface BrandOut {
  id: number;
  name: string;
}

export interface BrandInput {
  name: string;
}

export interface MechanismTypeOut {
  id: number;
  name: string;
}

export interface MechanismTypeInput {
  name: string;
}

export interface AttributeTypeOut {
  id: number;
  name: string;
}

export interface AttributeTypeInput {
  name: string;
}

export interface AttributeValueOut {
  id: number;
  attribute_type_id: number;
  value: string;
}

export interface AttributeValueInput {
  attribute_type_id: number;
  value: string;
}

export interface AdminCategory {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  created_at: string;
}

export interface CategoryInput {
  name: string;
  parent_id: number | null;
}

export type OrderStatus = "new" | "processing" | "confirmed" | "shipped" | "completed" | "cancelled";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Новий",
  processing: "У обробці",
  confirmed: "Підтверджено",
  shipped: "Відправлено",
  completed: "Виконано",
  cancelled: "Скасовано",
};

export const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  "new",
  "processing",
  "confirmed",
  "shipped",
  "completed",
  "cancelled",
];

export interface AdminOrderListItem {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  status: OrderStatus;
  total: number;
  created_at: string;
}

export interface AdminOrderListResponse {
  items: AdminOrderListItem[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface AdminOrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price_at_order: number;
}

export interface AdminOrderDetail {
  id: number;
  user_id: number | null;
  first_name: string;
  last_name: string;
  phone: string;
  city: string;
  city_ref: string | null;
  delivery_method: "nova_poshta" | "ukrposhta" | "courier" | "pickup";
  np_office: string | null;
  warehouse_ref: string | null;
  contact_method: "call" | "telegram" | "viber";
  comment: string | null;
  status: OrderStatus;
  promo_code_id: number | null;
  promo_code: string | null;
  items_total: number;
  discount_amount: number;
  total: number;
  created_at: string;
  items: AdminOrderItem[];
}
