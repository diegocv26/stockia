import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { serializeTeamUser } from '../utils/serializers.js';

const SALT_ROUNDS = 10;

export async function listUsers(req, res) {
  const { rows } = await query(
    `SELECT id, name, email, role, is_active, created_at
       FROM users
      WHERE store_id = $1
      ORDER BY created_at`,
    [req.user.storeId]
  );
  res.json({ users: rows.map(serializeTeamUser) });
}

export async function createUser(req, res) {
  const { name, email, password, role } = req.valid.body;
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const {
    rows: [user],
  } = await query(
    `INSERT INTO users (store_id, name, email, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, role, is_active, created_at`,
    [req.user.storeId, name, email, passwordHash, role]
  );

  res.status(201).json({ user: serializeTeamUser(user) });
}

export async function updateUser(req, res) {
  const { id } = req.valid.params;
  const { name, role, isActive, password } = req.valid.body;

  // Evita que un admin se deje a sí mismo sin acceso
  if (id === req.user.id && (isActive === false || (role && role !== req.user.role))) {
    throw new AppError(400, 'CANNOT_MODIFY_SELF', 'No puedes desactivarte ni cambiar tu propio rol');
  }

  const passwordHash = password ? await bcrypt.hash(password, SALT_ROUNDS) : null;

  // COALESCE: si el valor es null, se conserva el que ya tenía
  const {
    rows: [user],
  } = await query(
    `UPDATE users
        SET name          = COALESCE($1, name),
            role          = COALESCE($2, role),
            is_active     = COALESCE($3, is_active),
            password_hash = COALESCE($4, password_hash)
      WHERE id = $5 AND store_id = $6
      RETURNING id, name, email, role, is_active, created_at`,
    [name ?? null, role ?? null, isActive ?? null, passwordHash, id, req.user.storeId]
  );

  if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
  res.json({ user: serializeTeamUser(user) });
}
