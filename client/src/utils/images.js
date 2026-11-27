/**
 * Pide a Cloudinary una versión recortada y optimizada (en vez de la original de 1200 px).
 * Si la URL no es de Cloudinary, la devuelve igual.
 */
export function thumbUrl(url, size = 200) {
  if (!url || !url.includes('/upload/')) return url;
  return url.replace('/upload/', `/upload/c_fill,w_${size},h_${size},f_auto,q_auto/`);
}
