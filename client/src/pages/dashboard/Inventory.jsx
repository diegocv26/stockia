import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, ButtonGroup, InputGroup, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import Pager from '../../components/Pager.jsx';
import ProductTable from '../../components/inventory/ProductTable.jsx';
import ProductGrid from '../../components/inventory/ProductGrid.jsx';
import ProductFormModal from '../../components/inventory/ProductFormModal.jsx';
import AdjustStockModal from '../../components/inventory/AdjustStockModal.jsx';
import CategoryManagerModal from '../../components/inventory/CategoryManagerModal.jsx';
import { productsApi } from '../../api/products.js';
import { categoriesApi } from '../../api/categories.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { getErrorMessage } from '../../utils/errors.js';

const PAGE_SIZE = 12;
const VIEW_KEY = 'stockia-inventory-view';

const SORT_OPTIONS = [
  { value: 'name:asc', label: 'Nombre (A-Z)' },
  { value: 'name:desc', label: 'Nombre (Z-A)' },
  { value: 'price:asc', label: 'Precio: menor a mayor' },
  { value: 'price:desc', label: 'Precio: mayor a menor' },
  { value: 'stock:asc', label: 'Stock: menor a mayor' },
  { value: 'stock:desc', label: 'Stock: mayor a menor' },
  { value: 'best_selling:desc', label: 'Más vendidos' },
];

function initialView() {
  const saved = localStorage.getItem(VIEW_KEY);
  if (saved === 'table' || saved === 'cards') return saved;
  return window.innerWidth < 768 ? 'cards' : 'table';
}

export default function Inventory() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const qc = useQueryClient();

  // Filtros
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [categoryId, setCategoryId] = useState(null);
  const [lowStock, setLowStock] = useState(false);
  const [status, setStatus] = useState('active'); // 'active' | 'deleted' (solo admin)
  const [sortValue, setSortValue] = useState('name:asc');
  const [page, setPage] = useState(1);
  const [view, setView] = useState(initialView);

  // Modales (el `key` fuerza un formulario limpio en cada apertura)
  const [formModal, setFormModal] = useState({ open: false, key: 0, product: null });
  const [stockModal, setStockModal] = useState({ open: false, key: 0, product: null });
  const [showCategories, setShowCategories] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [sort, order] = sortValue.split(':');
  const params = {
    search: debouncedSearch.trim() || undefined,
    categoryId: categoryId ?? undefined,
    lowStock: lowStock || undefined,
    active: status === 'deleted' ? 'false' : 'true',
    sort,
    order,
    page,
    limit: PAGE_SIZE,
  };

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
    staleTime: 60_000,
  });

  const { data, isLoading, isError, error, refetch, isPlaceholderData } = useQuery({
    queryKey: ['products', 'list', params],
    queryFn: () => productsApi.list(params),
    placeholderData: keepPreviousData,
  });

  const { data: lowStockInfo } = useQuery({
    queryKey: ['products', 'low-stock'],
    queryFn: () => productsApi.lowStock(1),
  });

  const products = data?.products ?? [];
  const pagination = data?.pagination;
  const hasFilters = Boolean(debouncedSearch.trim() || categoryId || lowStock || status === 'deleted');

  const deleteMut = useMutation({
    mutationFn: (p) => productsApi.remove(p.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Producto eliminado. Puedes restaurarlo desde «Eliminados».');
      if (products.length === 1 && page > 1) setPage((p) => p - 1);
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const restoreMut = useMutation({
    mutationFn: (p) => productsApi.restore(p.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Producto restaurado');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // Cambios de filtro siempre vuelven a la página 1
  const changeSearch = (v) => { setSearch(v); setPage(1); };
  const selectCategory = (id) => { setCategoryId(id); setPage(1); };
  const toggleLowStock = () => { setLowStock((v) => !v); setPage(1); };
  const changeStatus = (v) => { setStatus(v); setPage(1); };
  const changeSort = (v) => { setSortValue(v); setPage(1); };
  const changeView = (v) => { setView(v); localStorage.setItem(VIEW_KEY, v); };

  const openCreate = () => setFormModal((m) => ({ open: true, key: m.key + 1, product: null }));
  const openEdit = (product) => setFormModal((m) => ({ open: true, key: m.key + 1, product }));
  const openAdjust = (product) => setStockModal((m) => ({ open: true, key: m.key + 1, product }));

  const actions = {
    onEdit: openEdit,
    onAdjust: openAdjust,
    onDelete: setDeleteTarget,
    onRestore: (p) => restoreMut.mutate(p),
  };

  return (
    <>
      <PageHeader
        title="Productos"
        subtitle="Catálogo e inventario de tu tienda"
        actions={
          isAdmin && (
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" onClick={() => setShowCategories(true)}>
                <i className="bi bi-tags me-1" />
                Categorías
              </Button>
              <Button variant="primary" onClick={openCreate}>
                <i className="bi bi-plus-lg me-1" />
                Nuevo producto
              </Button>
            </div>
          )
        }
      />

      {/* Barra de filtros */}
      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        <InputGroup style={{ maxWidth: 340 }}>
          <InputGroup.Text>
            <i className="bi bi-search" />
          </InputGroup.Text>
          <input
            className="form-control"
            placeholder="Buscar por nombre o SKU…"
            value={search}
            onChange={(e) => changeSearch(e.target.value)}
          />
        </InputGroup>

        <select className="form-select w-auto" value={sortValue} onChange={(e) => changeSort(e.target.value)} aria-label="Ordenar">
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <Button variant={lowStock ? 'warning' : 'outline-warning'} onClick={toggleLowStock}>
          <i className="bi bi-exclamation-triangle me-1" />
          Stock bajo
          {lowStockInfo?.total > 0 && <span className="badge text-bg-secondary ms-2">{lowStockInfo.total}</span>}
        </Button>

        {isAdmin && (
          <select className="form-select w-auto" value={status} onChange={(e) => changeStatus(e.target.value)} aria-label="Estado">
            <option value="active">Activos</option>
            <option value="deleted">Eliminados</option>
          </select>
        )}

        <ButtonGroup className="ms-auto">
          <Button variant="outline-secondary" active={view === 'table'} onClick={() => changeView('table')} aria-label="Vista de tabla" title="Tabla">
            <i className="bi bi-list-ul" />
          </Button>
          <Button variant="outline-secondary" active={view === 'cards'} onClick={() => changeView('cards')} aria-label="Vista de tarjetas" title="Tarjetas">
            <i className="bi bi-grid" />
          </Button>
        </ButtonGroup>
      </div>

      {/* Chips de categoría */}
      {categories.length > 0 && (
        <div className="st-chip-scroll mb-3">
          <Button size="sm" className="rounded-pill" variant={categoryId === null ? 'primary' : 'outline-secondary'} onClick={() => selectCategory(null)}>
            Todas
          </Button>
          {categories.map((c) => (
            <Button key={c.id} size="sm" className="rounded-pill" variant={categoryId === c.id ? 'primary' : 'outline-secondary'} onClick={() => selectCategory(c.id)}>
              {c.name} <span className="opacity-75">({c.productCount})</span>
            </Button>
          ))}
        </div>
      )}

      {/* Contenido */}
      {isLoading ? (
        <div className="text-center py-5">
          <Spinner />
        </div>
      ) : isError ? (
        <Alert variant="danger" className="d-flex justify-content-between align-items-center">
          <span>{getErrorMessage(error)}</span>
          <Button size="sm" variant="outline-danger" onClick={() => refetch()}>
            Reintentar
          </Button>
        </Alert>
      ) : products.length === 0 ? (
        <div className="text-center text-body-secondary py-5">
          <i className="bi bi-box-seam fs-1 d-block mb-2" />
          <p className="mb-3">
            {hasFilters ? 'No hay productos que coincidan con los filtros.' : 'Aún no hay productos en el catálogo.'}
          </p>
          {isAdmin && !hasFilters && (
            <Button variant="primary" onClick={openCreate}>
              <i className="bi bi-plus-lg me-1" />
              Crear el primer producto
            </Button>
          )}
        </div>
      ) : (
        <div style={{ opacity: isPlaceholderData ? 0.6 : 1, transition: 'opacity .15s' }}>
          {view === 'table' ? (
            <ProductTable products={products} isAdmin={isAdmin} {...actions} />
          ) : (
            <ProductGrid products={products} isAdmin={isAdmin} {...actions} />
          )}

          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
            <small className="text-body-secondary">
              Mostrando {products.length} de {pagination?.total ?? products.length}
            </small>
            <Pager page={pagination?.page ?? 1} totalPages={pagination?.totalPages ?? 1} onChange={setPage} />
          </div>
        </div>
      )}

      {/* Modales (solo admin) */}
      {isAdmin && (
        <>
          <ProductFormModal
            key={`form-${formModal.key}`}
            show={formModal.open}
            product={formModal.product}
            categories={categories}
            onHide={() => setFormModal((m) => ({ ...m, open: false }))}
          />
          {stockModal.product && (
            <AdjustStockModal
              key={`stock-${stockModal.key}`}
              show={stockModal.open}
              product={stockModal.product}
              onHide={() => setStockModal((m) => ({ ...m, open: false }))}
            />
          )}
          <CategoryManagerModal
            show={showCategories}
            categories={categories}
            onHide={() => setShowCategories(false)}
            onDeleted={(id) => categoryId === id && selectCategory(null)}
          />
          <ConfirmModal
            show={Boolean(deleteTarget)}
            title="Eliminar producto"
            confirmLabel="Eliminar"
            loading={deleteMut.isPending}
            onConfirm={() => deleteMut.mutate(deleteTarget)}
            onHide={() => setDeleteTarget(null)}
          >
            <p className="mb-0">
              <strong>{deleteTarget?.name}</strong> dejará de aparecer en el catálogo y en las ventas, pero se conserva su
              historial. Podrás restaurarlo desde el filtro «Eliminados».
            </p>
          </ConfirmModal>
        </>
      )}
    </>
  );
}
