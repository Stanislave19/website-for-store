export type Gender = "male" | "female" | "unisex";

export interface ProductListItem {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  old_price: number | null;
  brand: string;
  main_image: string | null;
}

export interface ProductListResponse {
  items: ProductListItem[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface ProductImage {
  id: number;
  url: string;
  position: number;
}

export interface AttributeValueOut {
  attribute_type: string;
  value: string;
}

export interface ProductDetail {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  old_price: number | null;
  sku: string;
  category_id: number;
  category: string;
  brand: string;
  mechanism_type: string;
  gender: Gender;
  case_diameter_mm: number | null;
  warranty_months: number | null;
  package_contents: string | null;
  is_active: boolean;
  created_at: string;
  images: ProductImage[];
  attributes: AttributeValueOut[];
}

export interface CategoryNode {
  id: number;
  name: string;
  slug: string;
  children: CategoryNode[];
}

export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

export interface FilterGroup {
  key: string;
  label: string;
  options: FilterOption[];
}

export interface NumericRange {
  min: number;
  max: number;
}

export interface FiltersResponse {
  categorical: FilterGroup[];
  price: NumericRange;
  diameter: NumericRange;
}

export type SortOption = "newest" | "price_asc" | "price_desc";

export interface ProductListParams {
  category?: number;
  brand?: number;
  gender?: Gender;
  mechanism?: number;
  price_min?: number;
  price_max?: number;
  diameter_min?: number;
  diameter_max?: number;
  attribute_value_ids?: number[];
  search?: string;
  sort?: SortOption;
  page?: number;
  page_size?: number;
}
