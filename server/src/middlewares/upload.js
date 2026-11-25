import multer from 'multer';
import { AppError } from '../utils/AppError.js';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);

// El mimetype lo declara el cliente (se puede falsificar): verificamos también los bytes iniciales.
const SIGNATURES = {
  'image/jpeg': (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/png': (b) =>
    b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'image/webp': (b) =>
    b.length > 12 && b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP',
};

const upload = multer({
  storage: multer.memoryStorage(), // nada a disco: Render tiene disco efímero
  limits: { fileSize: MAX_SIZE, files: 1 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIMES.has(file.mimetype)) return cb(null, true);
    cb(new AppError(400, 'INVALID_FORMAT', 'La imagen debe ser JPG, PNG o WebP'));
  },
});

/** Acepta 0 o 1 imagen en el campo `field`. Si la petición es JSON, no hace nada. */
export function uploadSingleImage(field = 'image') {
  const handler = upload.single(field);

  return (req, res, next) => {
    handler(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new AppError(413, 'PAYLOAD_TOO_LARGE', 'La imagen no puede pesar más de 5 MB'));
          }
          return next(new AppError(400, 'INVALID_FORMAT', `Envía una sola imagen en el campo "${field}"`));
        }
        return next(err);
      }

      req.body ??= {}; // Express 5: req.body puede ser undefined

      if (req.file && !SIGNATURES[req.file.mimetype]?.(req.file.buffer)) {
        return next(new AppError(400, 'INVALID_FORMAT', 'El archivo no es una imagen válida'));
      }
      next();
    });
  };
}
