import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const required = ['DATABASE_URL', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Faltan variables de entorno: ${missing.join(', ')}`);
  process.exit(1);
}

const nodeEnv = process.env.NODE_ENV || 'development';

export const env = {
  nodeEnv,
  isProd: nodeEnv === 'production',
  port: Number(process.env.PORT) || 4000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  // CLIENT_URL admite varias URLs separadas por coma
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  rateApiUrl: process.env.RATE_API_URL || 'https://ve.dolarapi.com',
  rateMaxAgeHours: Number(process.env.RATE_MAX_AGE_HOURS) || 6,
};

if (env.jwtSecret.length < 32) {
  console.warn('⚠️  JWT_SECRET es muy corto. Usa al menos 32 caracteres.');
}
