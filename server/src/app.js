import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import routes from './routes/index.js';

const app = express();

// En Render hay un proxy delante: necesario para que el rate limit vea la IP real
if (env.isProd) app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: env.clientUrls }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.isProd ? 'combined' : 'dev'));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
