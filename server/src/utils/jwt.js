import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// El token solo lleva el id del usuario. El rol y el estado se leen de la BD en cada petición.
export const signToken = (userId) =>
  jwt.sign({ sub: String(userId) }, env.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: env.jwtExpiresIn,
  });

export const verifyToken = (token) =>
  jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
