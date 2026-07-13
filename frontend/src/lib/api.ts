import type {
  CategoryNode,
  FiltersResponse,
  ProductDetail,
  ProductListParams,
  ProductListResponse,
} from "@/types/catalog";

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
