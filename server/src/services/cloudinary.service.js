import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';
import { AppError } from '../utils/AppError.js';

/**
 * Sube un Buffer a Cloudinary en la carpeta stockia/store-{storeId}.
 * Limita el lado mayor a 1200 px para ahorrar cuota del plan gratis.
 * @returns {Promise<{url: string, publicId: string}>}
 */
export function uploadProductImage(buffer, storeId) {
  if (!isCloudinaryConfigured) {
    throw new AppError(503, 'IMAGES_UNAVAILABLE', 'El servicio de imágenes no está configurado');
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `stockia/store-${storeId}`,
        resource_type: 'image',
        transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
      },
      (error, result) => {
        if (error || !result) {
          console.error('[cloudinary] Error al subir:', error?.message ?? error);
          return reject(
            new AppError(502, 'IMAGE_UPLOAD_FAILED', 'No se pudo subir la imagen. Intenta de nuevo.')
          );
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

/** Borra una imagen. Nunca lanza: una imagen huérfana no debe tumbar la petición. */
export async function deleteImage(publicId) {
  if (!publicId || !isCloudinaryConfigured) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
  } catch (err) {
    console.error('[cloudinary] No se pudo borrar', publicId, '-', err.message);
  }
}
