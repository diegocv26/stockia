// De snake_case (BD) a camelCase (API)
export const serializeUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  storeId: u.store_id,
  storeName: u.store_name,
});

export const serializeTeamUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  isActive: u.is_active,
  createdAt: u.created_at,
});

export const serializeCategory = (r) => ({
  id: r.id,
  name: r.name,
  productCount: r.product_count ?? 0,
});

/** costUsd solo se incluye para admin. image_public_id nunca sale al cliente. */
export function serializeProduct(r, { isAdmin = false } = {}) {
  const product = {
    id: r.id,
    sku: r.sku,
    name: r.name,
    description: r.description,
    categoryId: r.category_id,
    categoryName: r.category_name ?? null,
    priceUsd: r.price_usd,
    stock: r.stock,
    minStock: r.min_stock,
    lowStock: r.stock <= r.min_stock,
    imageUrl: r.image_url,
    isActive: r.is_active,
    unitsSold: r.units_sold ?? 0,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
  if (isAdmin) product.costUsd = r.cost_usd;
  return product;
}
