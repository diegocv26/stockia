// Verde: stock sano · Amarillo: stock <= mínimo · Rojo: agotado
export default function StockBadge({ stock, minStock }) {
  if (stock === 0) return <span className="badge text-bg-danger">0 · Agotado</span>;
  if (stock <= minStock) return <span className="badge text-bg-warning">{stock} · Bajo</span>;
  return <span className="badge text-bg-success">{stock}</span>;
}
