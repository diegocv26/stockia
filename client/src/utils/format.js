export const ROLE_LABELS = { admin: 'Administrador', seller: 'Vendedor' };

export const getInitials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((word) => word[0].toUpperCase()).join('');

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
