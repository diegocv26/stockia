import pg from 'pg';
import { env } from './env.js';

const { Pool, types } = pg;

// Por defecto pg devuelve NUMERIC (1700) y BIGINT (20, p. ej. COUNT) como texto,
// y DATE (1082) como objeto Date. Los convertimos para que el JSON sea limpio.
types.setTypeParser(1700, (value) => parseFloat(value));
types.setTypeParser(20, (value) => parseInt(value, 10));
types.setTypeParser(1082, (value) => value); // DATE -> 'YYYY-MM-DD'

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.isProd ? { rejectUnauthorized: false } : undefined,
  max: 10,
  idleTimeoutMillis: 10_000, // cierra conexiones ociosas antes de que Neon suspenda el cómputo
  connectionTimeoutMillis: 15_000, // da tiempo a que Neon despierte
});

// Sin este listener, una conexión ociosa cortada por el servidor tumbaría el proceso
pool.on('error', (err) => {
  console.error('Error en una conexión ociosa de Postgres:', err.message);
});

export const query = (text, params) => pool.query(text, params);

// Ejecuta varias consultas como una sola transacción (se usará en ventas y compras)
export async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}
