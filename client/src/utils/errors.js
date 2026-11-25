// Convierte cualquier error de axios en un mensaje legible para el usuario
export function getErrorMessage(err, fallback = 'Ocurrió un error inesperado') {
  if (err?.response) return err.response.data?.error?.message || fallback;
  if (err?.code === 'ECONNABORTED') return 'El servidor tardó demasiado en responder. Intenta de nuevo.';
  if (err?.request) return 'No se pudo conectar con el servidor. Revisa tu conexión.';
  return fallback;
}
