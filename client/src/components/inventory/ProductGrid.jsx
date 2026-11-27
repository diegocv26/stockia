import { Row, Col, Card } from 'react-bootstrap';
import StockBadge from './StockBadge.jsx';
import ProductActions from './ProductActions.jsx';
import { formatUSD } from '../../utils/format.js';
import { thumbUrl } from '../../utils/images.js';

export default function ProductGrid({ products, isAdmin, ...actions }) {
  return (
    <Row xs={1} sm={2} lg={3} xl={4} className="g-3">
      {products.map((p) => (
        <Col key={p.id}>
          <Card className={`h-100 st-product-card${p.isActive ? '' : ' is-inactive'}`}>
            {p.imageUrl ? (
              <img className="st-card-img" src={thumbUrl(p.imageUrl, 500)} alt={p.name} loading="lazy" />
            ) : (
              <div className="st-card-img d-flex align-items-center justify-content-center text-body-secondary fs-1">
                <i className="bi bi-image" />
              </div>
            )}
            <Card.Body className="d-flex flex-column">
              <div className="small text-body-secondary mb-1">{p.categoryName ?? 'Sin categoría'}</div>
              <Card.Title as="h6" className="mb-1">
                {p.name}
              </Card.Title>
              {p.sku && (
                <div className="small text-body-secondary mb-2">
                  <i className="bi bi-upc me-1" />
                  {p.sku}
                </div>
              )}
              <div className="mt-auto d-flex justify-content-between align-items-end pt-2">
                <div>
                  <div className="fs-5 fw-semibold">{formatUSD(p.priceUsd)}</div>
                  {isAdmin && <div className="small text-body-secondary">Costo {formatUSD(p.costUsd)}</div>}
                </div>
                <StockBadge stock={p.stock} minStock={p.minStock} />
              </div>
            </Card.Body>
            {isAdmin && (
              <Card.Footer className="d-flex justify-content-end">
                <ProductActions product={p} {...actions} />
              </Card.Footer>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
}
