import bcrypt from 'bcryptjs';
import { query, withTransaction } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { signToken } from '../utils/jwt.js';
import { serializeUser } from '../utils/serializers.js';

const SALT_ROUNDS = 10;
// Se compara contra este hash cuando el correo no existe, para que el tiempo de respuesta sea parecido
const DUMMY_HASH = bcrypt.hashSync('contraseña-falsa', SALT_ROUNDS);

// Crea la tienda y su primer usuario (admin) en una sola transacción
export async function register(req, res) {
  const { storeName, name, email, password } = req.valid.body;
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await withTransaction(async (client) => {
    const {
      rows: [store],
    } = await client.query('INSERT INTO stores (name) VALUES ($1) RETURNING id, name', [storeName]);

    const {
      rows: [newUser],
    } = await client.query(
      `INSERT INTO users (store_id, name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, 'admin')
       RETURNING id, name, email, role, store_id`,
      [store.id, name, email, passwordHash]
    );

    return { ...newUser, store_name: store.name };
  });

  res.status(201).json({ token: signToken(user.id), user: serializeUser(user) });
}

export async function login(req, res) {
  const { email, password } = req.valid.body;

  const {
    rows: [user],
  } = await query(
    `SELECT u.id, u.name, u.email, u.role, u.password_hash, u.is_active, u.store_id, s.name AS store_name
       FROM users u
       JOIN stores s ON s.id = u.store_id
      WHERE u.email = $1`,
    [email]
  );

  const validPassword = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH);
  if (!user || !validPassword) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Correo o contraseña incorrectos');
  }
  if (!user.is_active) {
    throw new AppError(403, 'USER_DISABLED', 'Tu usuario está desactivado. Contacta al administrador');
  }

  res.json({ token: signToken(user.id), user: serializeUser(user) });
}

export function me(req, res) {
  res.json({ user: req.user });
}
