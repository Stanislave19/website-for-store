import type {
  CategoryNode,
  FiltersResponse,
  ProductDetail,
  ProductListParams,
  ProductListResponse,
  PromoValidateResponse,
} from "@/types/catalog";
import type { OrderCreateRequest, OrderCreateResponse } from "@/types/order";

const API_URL =
  typeof window === "undefined"
    ? (process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL)
    : process.env.NEXT_PUBLIC_API_URL;

async function apiFetch<T>(path: string, revalidate = 60): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    next: { revalidate },
  });
  if (!res.ok) {
    throw new Error(`Помилка запиту до API: ${path} (${res.status})`);
  }
  return res.json() as Promise<T>;
}

function buildQuery(params: ProductListParams): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      for (const item of value) query.append(key, String(item));
    } else {
      query.set(key, String(value));
    }
  }
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export function getProducts(params: ProductListParams = {}): Promise<ProductListResponse> {
  return apiFetch<ProductListResponse>(`/products${buildQuery(params)}`);
}

export function getProductBySlug(slug: string): Promise<ProductDetail> {
  return apiFetch<ProductDetail>(`/products/${slug}`);
}

export function getCategories(): Promise<CategoryNode[]> {
  return apiFetch<CategoryNode[]>("/categories");
}

export function getFilters(): Promise<FiltersResponse> {
  return apiFetch<FiltersResponse>("/filters");
}

export async function validatePromoCode(
  code: string,
  cartTotal: number,
): Promise<PromoValidateResponse> {
  const res = await fetch(`${API_URL}/cart/validate-promo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, cart_total: cartTotal }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Помилка перевірки промокоду (${res.status})`);
  }
  return res.json() as Promise<PromoValidateResponse>;
}

export class OrderApiError extends Error {
  status: number;
  promoError?: string;

  constructor(status: number, message: string, promoError?: string) {
    super(message);
    this.status = status;
    this.promoError = promoError;
  }
}

interface PydanticErrorItem {
  msg?: string;
}

export async function createOrder(payload: OrderCreateRequest): Promise<OrderCreateResponse> {
  const res = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!res.ok) {
    let detail: unknown;
    try {
      detail = (await res.json()).detail;
    } catch {
      detail = undefined;
    }

    if (
      res.status === 422 &&
      detail &&
      typeof detail === "object" &&
      !Array.isArray(detail) &&
      "promo_error" in detail
    ) {
      const promoError = (detail as { promo_error: string }).promo_error;
      throw new OrderApiError(422, promoError, promoError);
    }

    if (res.status === 429) {
      throw new OrderApiError(429, "Забагато заявок з цієї адреси. Спробуйте через хвилину.");
    }

    const message = Array.isArray(detail)
      ? (detail as PydanticErrorItem[]).map((item) => item.msg).filter(Boolean).join("; ")
      : typeof detail === "string"
        ? detail
        : "Не вдалося оформити замовлення. Спробуйте ще раз.";
    throw new OrderApiError(res.status, message || "Не вдалося оформити замовлення.");
  }

  return res.json() as Promise<OrderCreateResponse>;
}
