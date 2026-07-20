export type CatalogSearchParams = Record<string, string | string[] | undefined>;

function toSearchParams(params: CatalogSearchParams): URLSearchParams {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) query.append(key, item);
    } else {
      query.set(key, value);
    }
  }
  return query;
}

export function getParam(params: CatalogSearchParams, key: string): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export function getParamList(params: CatalogSearchParams, key: string): string[] {
  const value = params[key];
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

/** Href that toggles a single-select filter (category, brand, gender, mechanism). Resets page. */
export function toggleSingleHref(
  params: CatalogSearchParams,
  key: string,
  value: string,
): string {
  const query = toSearchParams(params);
  const current = query.get(key);
  query.delete("page");
  if (current === value) {
    query.delete(key);
  } else {
    query.set(key, value);
  }
  const qs = query.toString();
  return `/catalog${qs ? `?${qs}` : ""}`;
}

/** Href that toggles membership of `value` in a multi-select filter (attribute_value_ids). Resets page. */
export function toggleMultiHref(
  params: CatalogSearchParams,
  key: string,
  value: string,
): string {
  const current = getParamList(params, key);
  const next = current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];

  const query = toSearchParams(params);
  query.delete(key);
  query.delete("page");
  for (const item of next) query.append(key, item);
  const qs = query.toString();
  return `/catalog${qs ? `?${qs}` : ""}`;
}

export function hrefWithParam(
  params: CatalogSearchParams,
  key: string,
  value: string | undefined,
): string {
  const query = toSearchParams(params);
  query.delete("page");
  if (value === undefined || value === "") {
    query.delete(key);
  } else {
    query.set(key, value);
  }
  const qs = query.toString();
  return `/catalog${qs ? `?${qs}` : ""}`;
}

export function hrefWithoutParams(params: CatalogSearchParams, keys: string[]): string {
  const query = toSearchParams(params);
  query.delete("page");
  for (const key of keys) query.delete(key);
  const qs = query.toString();
  return `/catalog${qs ? `?${qs}` : ""}`;
}

export function hrefWithPage(params: CatalogSearchParams, page: number): string {
  const query = toSearchParams(params);
  query.set("page", String(page));
  const qs = query.toString();
  return `/catalog${qs ? `?${qs}` : ""}`;
}
