import { query } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { verifyToken } from '../utils/jwt.js';
import { serializeUser } from '../utils/serializers.js';

export async function authenticate(req, _res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new AppError(401, 'NO_TOKEN', 'Debes iniciar sesión');
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    const expired = err.name === 'TokenExpiredError';
    throw new AppError(
      401,
      expired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
      expired ? 'Tu sesión expiró, inicia sesión de nuevo' : 'Token inválido'
    );
  }

  // Se consulta el usuario en cada petición: si lo desactivan o le cambian el rol, aplica al instante
  const { rows } = await query(
    `SELECT u.id, u.name, u.email, u.role, u.is_active, u.store_id, s.name AS store_name
       FROM users u
       JOIN stores s ON s.id = u.store_id
      WHERE u.id = $1`,
    [payload.sub]
  );
  const user = rows[0];
  if (!user || !user.is_active) {
    throw new AppError(401, 'USER_INACTIVE', 'Usuario no disponible');
  }

  req.user = serializeUser(user);
  next();
}
