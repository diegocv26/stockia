export const NAV_GROUPS = [
  {
    title: 'Principal',
    items: [{ to: '/app', label: 'Resumen', icon: 'bi-speedometer2', end: true, phase: 7 }],
  },
  {
    title: 'Ventas',
    items: [
      { to: '/app/ventas/nueva', label: 'Nueva venta', icon: 'bi-cart-plus', phase: 4 },
      { to: '/app/ventas', label: 'Historial', icon: 'bi-receipt', end: true, phase: 4 },
      { to: '/app/cuentas-por-cobrar', label: 'Cuentas por cobrar', icon: 'bi-wallet2', phase: 6 },
      { to: '/app/clientes', label: 'Clientes', icon: 'bi-people', phase: 4 },
    ],
  },
  {
    title: 'Inventario',
    items: [
      { to: '/app/inventario', implemented: true, label: 'Productos', icon: 'bi-box-seam', phase: 2 },
      { to: '/app/movimientos', label: 'Movimientos', icon: 'bi-arrow-left-right', phase: 5 },
      { to: '/app/compras', label: 'Compras', icon: 'bi-truck', phase: 5, roles: ['admin'] },
      { to: '/app/proveedores', label: 'Proveedores', icon: 'bi-shop', phase: 5, roles: ['admin'] },
    ],
  },
  {
    title: 'Administración',
    items: [
      { to: '/app/caja', label: 'Cierre de caja', icon: 'bi-cash-stack', phase: 6, roles: ['admin'] },
      { to: '/app/reportes', label: 'Reportes', icon: 'bi-graph-up-arrow', phase: 7, roles: ['admin'] },
      { to: '/app/usuarios', label: 'Usuarios', icon: 'bi-person-gear', roles: ['admin'], implemented: true },
      { to: '/app/configuracion', label: 'Configuración', icon: 'bi-gear', phase: 3, roles: ['admin'] },
    ],
  },
];

export const NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items);

// Módulos que aún no existen: se renderiza una pantalla "Próximamente"
export const PENDING_ITEMS = NAV_ITEMS.filter((item) => !item.implemented && item.to !== '/app');

// Grupos e ítems que puede ver un rol
export const visibleGroups = (role) =>
  NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.roles || item.roles.includes(role)),
  })).filter((group) => group.items.length > 0);
