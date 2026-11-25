import { query, withTransaction } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { serializeProduct } from '../utils/serializers.js';
import { uploadProductImage, deleteImage } from '../services/cloudinary.service.js';

const isAdmin = (req) => req.user.role === 'admin';
const notFound = () => new AppError(404, 'NOT_FOUND', 'Producto no encontrado');

// $1 = storeId SIEMPRE. unitsSold = unidades de ventas completadas (0 hasta la fase 4).
const PRODUCT_SELECT = `
  SELECT p.id, p.sku, p.name, p.description, p.category_id, c.name AS category_name,
         p.price_usd, p.cost_usd, p.stock, p.min_stock, p.image_url, p.is_active,
         p.created_at, p.updated_at,
         COALESCE(us.units_sold, 0)::int AS units_sold
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN (
      SELECT si.product_id, SUM(si.quantity)::int AS units_sold
        FROM sale_items si
        JOIN sales s ON s.id = si.sale_id
       WHERE s.store_id = $1 AND s.status = 'completed'
       GROUP BY si.product_id
    ) us ON us.product_id = p.id`;

async function fetchProductRow(storeId, id) {
  const { rows } = await query(`${PRODUCT_SELECT} WHERE p.store_id = $1 AND p.id = $2`, [storeId, id]);
  return rows[0] ?? null;
}

async function assertCategoryExists(storeId, categoryId) {
  const { rowCount } = await query('SELECT 1 FROM categories WHERE id = $1 AND store_id = $2', [
    categoryId,
    storeId,
  ]);
  if (!rowCount) {
    throw new AppError(400, 'VALIDATION_ERROR', 'La categoría seleccionada no existe', [
      { field: 'categoryId', message: 'La categoría no existe' },
    ]);
  }
}

const escapeLike = (s) => s.replace(/[\\%_]/g, '\\$&');

const SORT_COLUMNS = {
  name: 'LOWER(p.name)',
  price: 'p.price_usd',
  stock: 'p.stock',
  best_selling: 'COALESCE(us.units_sold, 0)',
};

// ---------------------------------------------------------------- lectura
export async function listProducts(req, res) {
  const { search, categoryId, lowStock, active, sort, order, page, limit } = req.valid.query;
  const { storeId } = req.user;

  const params = [storeId];
  const where = ['p.store_id = $1'];
  const add = (value) => {
    params.push(value);
    return `$${params.length}`;
  };

  if (active !== 'all') where.push(`p.is_active = ${add(active === 'true')}`);
  if (categoryId) where.push(`p.category_id = ${add(categoryId)}`);
  if (lowStock) where.push('p.stock <= p.min_stock');
  if (search) {
    const ph = add(`%${escapeLike(search)}%`);
    where.push(`(p.name ILIKE ${ph} OR p.sku ILIKE ${ph})`);
  }
  const whereSql = where.join(' AND ');

  const dir = (order ?? (sort === 'best_selling' ? 'desc' : 'asc')) === 'desc' ? 'DESC' : 'ASC';

  // El count usa solo los filtros; la lista añade limit/offset después.
  const countPromise = query(`SELECT COUNT(*)::int AS total FROM products p WHERE ${whereSql}`, [...params]);

  const limitPh = add(limit);
  const offsetPh = add((page - 1) * limit);
  const listPromise = query(
    `${PRODUCT_SELECT}
      WHERE ${whereSql}
      ORDER BY ${SORT_COLUMNS[sort]} ${dir}, p.id ASC
      LIMIT ${limitPh} OFFSET ${offsetPh}`,
    params
  );

  const [{ rows }, { rows: countRows }] = await Promise.all([listPromise, countPromise]);
  const total = countRows[0].total;

  res.json({
    products: rows.map((r) => serializeProduct(r, { isAdmin: isAdmin(req) })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function listLowStock(req, res) {
  const { storeId } = req.user;
  const { limit } = req.valid.query;

  const [{ rows }, { rows: countRows }] = await Promise.all([
    query(
      `${PRODUCT_SELECT}
        WHERE p.store_id = $1 AND p.is_active AND p.stock <= p.min_stock
        ORDER BY (p.stock - p.min_stock) ASC, LOWER(p.name) ASC
        LIMIT $2`,
      [storeId, limit]
    ),
    query(
      'SELECT COUNT(*)::int AS total FROM products p WHERE p.store_id = $1 AND p.is_active AND p.stock <= p.min_stock',
      [storeId]
    ),
  ]);

  res.json({
    products: rows.map((r) => serializeProduct(r, { isAdmin: isAdmin(req) })),
    total: countRows[0].total,
  });
}

export async function getProduct(req, res) {
  const row = await fetchProductRow(req.user.storeId, req.valid.params.id);
  if (!row) throw notFound();
  res.json({ product: serializeProduct(row, { isAdmin: isAdmin(req) }) });
}

// ---------------------------------------------------------------- escritura (admin)
export async function createProduct(req, res) {
  const { storeId, id: userId } = req.user;
  const data = req.valid.body;

  if (data.categoryId) await assertCategoryExists(storeId, data.categoryId);

  const image = req.file ? await uploadProductImage(req.file.buffer, storeId) : null;

  let productId;
  try {
    productId = await withTransaction(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO products
           (store_id, category_id, sku, name, description, price_usd, cost_usd,
            stock, min_stock, image_url, image_public_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id`,
        [
          storeId,
          data.categoryId ?? null,
          data.sku ?? null,
          data.name,
          data.description ?? null,
          data.priceUsd,
          data.costUsd,
          data.stock,
          data.minStock,
          image?.url ?? null,
          image?.publicId ?? null,
        ]
      );
      const id = rows[0].id;

      if (data.stock > 0) {
        await client.query(
          `INSERT INTO stock_movements (store_id, product_id, user_id, type, quantity, note)
           VALUES ($1, $2, $3, 'adjustment', $4, 'Stock inicial')`,
          [storeId, id, userId, data.stock]
        );
      }
      return id;
    });
  } catch (err) {
    if (image) await deleteImage(image.publicId); // no dejar imágenes huérfanas
    throw err;
  }

  const row = await fetchProductRow(storeId, productId);
  res.status(201).json({ product: serializeProduct(row, { isAdmin: true }) });
}

const UPDATABLE_COLUMNS = {
  sku: 'sku',
  name: 'name',
  description: 'description',
  categoryId: 'category_id',
  priceUsd: 'price_usd',
  costUsd: 'cost_usd',
  minStock: 'min_stock',
};

export async function updateProduct(req, res) {
  const { storeId } = req.user;
  const { id } = req.valid.params;
  const { removeImage, ...fields } = req.valid.body;

  const changedKeys = Object.keys(UPDATABLE_COLUMNS).filter((k) => fields[k] !== undefined);
  if (!changedKeys.length && !req.file && removeImage !== true) {
    throw new AppError(400, 'VALIDATION_ERROR', 'No hay cambios que guardar');
  }

  if (fields.categoryId) await assertCategoryExists(storeId, fields.categoryId);

  const newImage = req.file ? await uploadProductImage(req.file.buffer, storeId) : null;

  let oldPublicId = null;
  try {
    await withTransaction(async (client) => {
      const { rows } = await client.query(
        'SELECT image_public_id FROM products WHERE id = $1 AND store_id = $2 FOR UPDATE',
        [id, storeId]
      );
      if (!rows.length) throw notFound();
      oldPublicId = rows[0].image_public_id;

      const sets = [];
      const params = [];
      for (const key of changedKeys) {
        params.push(fields[key]);
        sets.push(`${UPDATABLE_COLUMNS[key]} = $${params.length}`);
      }
      if (newImage) {
        params.push(newImage.url, newImage.publicId);
        sets.push(`image_url = $${params.length - 1}`, `image_public_id = $${params.length}`);
      } else if (removeImage === true) {
        sets.push('image_url = NULL', 'image_public_id = NULL');
      }
      sets.push('updated_at = now()');

      params.push(id, storeId);
      await client.query(
        `UPDATE products SET ${sets.join(', ')}
          WHERE id = $${params.length - 1} AND store_id = $${params.length}`,
        params
      );
    });
  } catch (err) {
    if (newImage) await deleteImage(newImage.publicId);
    throw err;
  }

  // Solo tras confirmar el COMMIT se borra la imagen anterior.
  if ((newImage || removeImage === true) && oldPublicId) await deleteImage(oldPublicId);

  const row = await fetchProductRow(storeId, id);
  res.json({ product: serializeProduct(row, { isAdmin: true }) });
}

// Borrado lógico: conserva historial e imagen (para poder restaurar).
export async function deleteProduct(req, res) {
  const { rowCount } = await query(
    `UPDATE products SET is_active = false, updated_at = now()
      WHERE id = $1 AND store_id = $2 AND is_active`,
    [req.valid.params.id, req.user.storeId]
  );
  if (!rowCount) throw new AppError(404, 'NOT_FOUND', 'Producto no encontrado o ya eliminado');
  res.status(204).end();
}

export async function restoreProduct(req, res) {
  const { storeId } = req.user;
  const { id } = req.valid.params;
  const { rowCount } = await query(
    `UPDATE products SET is_active = true, updated_at = now()
      WHERE id = $1 AND store_id = $2 AND NOT is_active`,
    [id, storeId]
  );
  if (!rowCount) throw new AppError(404, 'NOT_FOUND', 'Producto no encontrado o ya está activo');
  const row = await fetchProductRow(storeId, id);
  res.json({ product: serializeProduct(row, { isAdmin: true }) });
}

// quantity > 0 suma, < 0 resta. Deja siempre un stock_movement en la misma transacción.
export async function adjustStock(req, res) {
  const { storeId, id: userId } = req.user;
  const { id } = req.valid.params;
  const { quantity, note } = req.valid.body;

  await withTransaction(async (client) => {
    const { rows } = await client.query(
      `UPDATE products SET stock = stock + $1, updated_at = now()
        WHERE id = $2 AND store_id = $3 AND stock + $1 >= 0
        RETURNING id`,
      [quantity, id, storeId]
    );

    if (!rows.length) {
      const { rows: current } = await client.query(
        'SELECT stock FROM products WHERE id = $1 AND store_id = $2',
        [id, storeId]
      );
      if (!current.length) throw notFound();
      throw new AppError(
        409,
        'INSUFFICIENT_STOCK',
        `No puedes restar ${Math.abs(quantity)} unidades: el stock actual es ${current[0].stock}`
      );
    }

    await client.query(
      `INSERT INTO stock_movements (store_id, product_id, user_id, type, quantity, note)
       VALUES ($1, $2, $3, 'adjustment', $4, $5)`,
      [storeId, id, userId, quantity, note]
    );
  });

  const row = await fetchProductRow(storeId, id);
  res.json({ product: serializeProduct(row, { isAdmin: true }) });
}
