import { query } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { serializeCategory } from '../utils/serializers.js';

const notFound = () => new AppError(404, 'NOT_FOUND', 'Categoría no encontrada');

export async function listCategories(req, res) {
  const { rows } = await query(
    `SELECT c.id, c.name, COUNT(p.id) FILTER (WHERE p.is_active)::int AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id AND p.store_id = c.store_id
      WHERE c.store_id = $1
      GROUP BY c.id
      ORDER BY LOWER(c.name)`,
    [req.user.storeId]
  );
  res.json({ categories: rows.map(serializeCategory) });
}

export async function createCategory(req, res) {
  const { rows } = await query(
    'INSERT INTO categories (store_id, name) VALUES ($1, $2) RETURNING id, name',
    [req.user.storeId, req.valid.body.name]
  );
  res.status(201).json({ category: serializeCategory(rows[0]) });
}

export async function updateCategory(req, res) {
  const { rows } = await query(
    'UPDATE categories SET name = $1 WHERE id = $2 AND store_id = $3 RETURNING id, name',
    [req.valid.body.name, req.valid.params.id, req.user.storeId]
  );
  if (!rows.length) throw notFound();
  res.json({ category: serializeCategory(rows[0]) });
}

// Los productos quedan sin categoría por el FK ON DELETE SET NULL.
export async function deleteCategory(req, res) {
  const { rowCount } = await query('DELETE FROM categories WHERE id = $1 AND store_id = $2', [
    req.valid.params.id,
    req.user.storeId,
  ]);
  if (!rowCount) throw notFound();
  res.status(204).end();
}
