import { Badge, Card, Col, Row } from 'react-bootstrap';
import PageHeader from '../../components/PageHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const PHASES = [
  ['Fase 1', 'Base, autenticación y panel', 'done'],
  ['Fase 2', 'Productos, categorías e imágenes', 'next'],
  ['Fase 3', 'Tasa del dólar e historial', 'todo'],
  ['Fase 4', 'Punto de venta, clientes y anulaciones', 'todo'],
  ['Fase 5', 'Movimientos, proveedores y compras', 'todo'],
  ['Fase 6', 'Fiado y cierre de caja', 'todo'],
  ['Fase 7', 'Dashboard real, reportes y exportación', 'todo'],
  ['Fase 8', 'PWA y despliegue', 'todo'],
];
const BADGES = { done: ['success', 'Listo'], next: ['primary', 'Siguiente'], todo: ['secondary', 'Pendiente'] };

export default function Overview() {
  const { user } = useAuth();

  return (
    <>
      <PageHeader title={`Hola, ${user.name.split(' ')[0]}`} subtitle={`Panel de ${user.storeName}`} />

      <Row className="g-3 mb-4">
        <Col sm={6} xl={3}><StatCard icon="bi-cash-coin" variant="success" label="Ventas de hoy" value="—" hint="Disponible en la fase 4" /></Col>
        <Col sm={6} xl={3}><StatCard icon="bi-receipt" variant="primary" label="Nº de ventas" value="—" hint="Disponible en la fase 4" /></Col>
        <Col sm={6} xl={3}><StatCard icon="bi-exclamation-triangle" variant="warning" label="Stock bajo" value="—" hint="Disponible en la fase 2" /></Col>
        <Col sm={6} xl={3}><StatCard icon="bi-currency-exchange" variant="info" label="Tasa del día" value="—" hint="Disponible en la fase 3" /></Col>
      </Row>

      <Card>
        <Card.Header className="bg-transparent fw-semibold py-3">Hoja de ruta del proyecto</Card.Header>
        <Card.Body className="p-0">
          <ul className="list-group list-group-flush">
            {PHASES.map(([phase, text, status]) => (
              <li key={phase} className="list-group-item bg-transparent d-flex align-items-center gap-3">
                <span className="fw-semibold" style={{ minWidth: '4.5rem' }}>{phase}</span>
                <span className="flex-grow-1">{text}</span>
                <Badge bg={BADGES[status][0]}>{BADGES[status][1]}</Badge>
              </li>
            ))}
          </ul>
        </Card.Body>
      </Card>
    </>
  );
}
