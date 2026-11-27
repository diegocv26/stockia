import ProductThumb from './ProductThumb.jsx';
import StockBadge from './StockBadge.jsx';
import ProductActions from './ProductActions.jsx';
import { formatUSD } from '../../utils/format.js';

export default function ProductTable({ products, isAdmin, ...actions }) {
  return (
    <div className="card">
      <div className="table-responsive">
        <table className="table st-table align-middle mb-0">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th className="text-end">Precio</th>
              {isAdmin && <th className="text-end">Costo</th>}
              <th className="text-center">Stock</th>
              <th className="text-end">Vendidos</th>
              {isAdmin && <th className="text-end">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className={p.isActive ? '' : 'text-body-secondary'}>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <ProductThumb url={p.imageUrl} name={p.name} />
                    <div className="min-w-0">
                      <div className="fw-medium">{p.name}</div>
                      {p.sku && <div className="small text-body-secondary">{p.sku}</div>}
                    </div>
                  </div>
                </td>
                <td>{p.categoryName ?? <span className="text-body-secondary">—</span>}</td>
                <td className="text-end fw-semibold">{formatUSD(p.priceUsd)}</td>
                {isAdmin && <td className="text-end">{formatUSD(p.costUsd)}</td>}
                <td className="text-center">
                  <StockBadge stock={p.stock} minStock={p.minStock} />
                </td>
                <td className="text-end">{p.unitsSold}</td>
                {isAdmin && (
                  <td className="text-end">
                    <ProductActions product={p} {...actions} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
