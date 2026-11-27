import { Button } from 'react-bootstrap';

export default function ProductActions({ product, onEdit, onAdjust, onDelete, onRestore }) {
  if (!product.isActive) {
    return (
      <Button size="sm" variant="outline-success" onClick={() => onRestore(product)}>
        <i className="bi bi-arrow-counterclockwise me-1" />
        Restaurar
      </Button>
    );
  }

  return (
    <div className="d-inline-flex gap-1">
      <Button size="sm" variant="outline-secondary" title="Ajustar stock" aria-label="Ajustar stock" onClick={() => onAdjust(product)}>
        <i className="bi bi-plus-slash-minus" />
      </Button>
      <Button size="sm" variant="outline-secondary" title="Editar" aria-label="Editar" onClick={() => onEdit(product)}>
        <i className="bi bi-pencil" />
      </Button>
      <Button size="sm" variant="outline-danger" title="Eliminar" aria-label="Eliminar" onClick={() => onDelete(product)}>
        <i className="bi bi-trash" />
      </Button>
    </div>
  );
}
