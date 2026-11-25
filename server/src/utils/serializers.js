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
