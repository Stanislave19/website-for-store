import type {
  AccountOrderDetail,
  AccountOrderListResponse,
  AddressInput,
  AddressOut,
  ClientSession,
  LoginInput,
  RegisterInput,
  WishlistProduct,
} from "@/types/account";

const API_URL =
  typeof window === "undefined"
    ? (process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL)
    : process.env.NEXT_PUBLIC_API_URL;

export class AccountApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function accountFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    cache: "no-store",
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
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
    throw new AccountApiError(res.status, detail);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export function registerClient(payload: RegisterInput): Promise<ClientSession> {
  return accountFetch<ClientSession>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginClient(payload: LoginInput): Promise<ClientSession> {
  return accountFetch<ClientSession>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logoutClient(): Promise<void> {
  return accountFetch<void>("/auth/logout", { method: "POST" });
}

export function getAccountSession(): Promise<ClientSession> {
  return accountFetch<ClientSession>("/auth/me");
}

export function listWishlist(): Promise<WishlistProduct[]> {
  return accountFetch<WishlistProduct[]>("/wishlist");
}

export function addWishlistItem(productId: number): Promise<WishlistProduct[]> {
  return accountFetch<WishlistProduct[]>("/wishlist", {
    method: "POST",
    body: JSON.stringify({ product_id: productId }),
  });
}

export function removeWishlistItem(productId: number): Promise<WishlistProduct[]> {
  return accountFetch<WishlistProduct[]>(`/wishlist/${productId}`, { method: "DELETE" });
}

export function listAccountOrders(params: { page?: number; page_size?: number } = {}): Promise<AccountOrderListResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.page_size) query.set("page_size", String(params.page_size));
  const qs = query.toString();
  return accountFetch<AccountOrderListResponse>(`/account/orders${qs ? `?${qs}` : ""}`);
}

export function getAccountOrder(id: number): Promise<AccountOrderDetail> {
  return accountFetch<AccountOrderDetail>(`/account/orders/${id}`);
}

export function listAddresses(): Promise<AddressOut[]> {
  return accountFetch<AddressOut[]>("/account/addresses");
}

export function createAddress(payload: AddressInput): Promise<AddressOut> {
  return accountFetch<AddressOut>("/account/addresses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteAddress(id: number): Promise<void> {
  return accountFetch<void>(`/account/addresses/${id}`, { method: "DELETE" });
}

export async function mergeGuestWishlist(productIds: number[]): Promise<void> {
  for (const productId of productIds) {
    try {
      await addWishlistItem(productId);
    } catch {
      // товар міг стати неактивним між додаванням у гостьовий список і входом — пропускаємо
    }
  }
}
