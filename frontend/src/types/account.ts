import type { OrderStatus } from "./admin";
import type { ContactMethod, DeliveryMethod } from "./order";

export interface ClientSession {
  id: number;
  email: string;
  phone: string | null;
}

export interface RegisterInput {
  email: string;
  password: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface WishlistProduct {
  product_id: number;
  slug: string;
  name: string;
  price: number;
  old_price: number | null;
  main_image: string | null;
}

export interface AddressOut {
  id: number;
  recipient_first_name: string;
  recipient_last_name: string;
  city: string;
  delivery_method: DeliveryMethod;
  np_office: string | null;
  is_default: boolean;
}

export interface AddressInput {
  recipient_first_name: string;
  recipient_last_name: string;
  city: string;
  delivery_method: DeliveryMethod;
  np_office?: string;
  is_default?: boolean;
}

export interface AccountOrderListItem {
  id: number;
  status: OrderStatus;
  total: number;
  created_at: string;
}

export interface AccountOrderListResponse {
  items: AccountOrderListItem[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface AccountOrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price_at_order: number;
}

export interface AccountOrderDetail {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  city: string;
  delivery_method: DeliveryMethod;
  np_office: string | null;
  contact_method: ContactMethod;
  comment: string | null;
  status: OrderStatus;
  promo_code: string | null;
  items_total: number;
  discount_amount: number;
  total: number;
  created_at: string;
  items: AccountOrderItem[];
}
