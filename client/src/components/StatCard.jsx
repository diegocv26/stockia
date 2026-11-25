import { Card } from 'react-bootstrap';

export default function StatCard({ icon, label, value, hint, variant = 'primary' }) {
  return (
    <Card className="h-100">
      <Card.Body className="d-flex align-items-center gap-3">
        <div className={`st-icon-box st-icon-${variant}`}><i className={`bi ${icon}`} /></div>
        <div>
          <div className="text-body-secondary small">{label}</div>
          <div className="fs-4 fw-bold lh-sm">{value}</div>
          {hint && <div className="text-body-secondary" style={{ fontSize: '0.75rem' }}>{hint}</div>}
        </div>
      </Card.Body>
    </Card>
  );
}
