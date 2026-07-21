export type DeliveryMethod = "nova_poshta" | "ukrposhta" | "courier" | "pickup";
export type ContactMethod = "call" | "telegram" | "viber";

export interface OrderItemInput {
  product_id: number;
  quantity: number;
}

export interface OrderCreateRequest {
  items: OrderItemInput[];
  first_name: string;
  last_name: string;
  phone: string;
  delivery_method: DeliveryMethod;
  city?: string;
  city_ref?: string;
  np_office?: string;
  warehouse_ref?: string;
  contact_method: ContactMethod;
  comment?: string;
  promo_code?: string;
  user_id?: number;
}

export interface OrderCreateResponse {
  order_id: number;
  items_total: number;
  discount_amount: number;
  total: number;
}
