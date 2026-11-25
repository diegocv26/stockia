import app from './app.js';
import { env } from './config/env.js';
import { pool } from './config/db.js';

const server = app.listen(env.port, () => {
  console.log(`API escuchando en http://localhost:${env.port} (${env.nodeEnv})`);
});

// Comprobación al arrancar: no bloquea el servidor si la BD tarda en despertar
pool
  .query('SELECT NOW() AS now')
  .then(() => console.log('Postgres conectado'))
  .catch((err) => console.error('No se pudo conectar a Postgres:', err.message));

// Render envía SIGTERM al reiniciar o redesplegar
function shutdown(signal) {
  console.log(`${signal} recibido, cerrando el servidor...`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => console.error('Promesa rechazada sin manejar:', reason));
