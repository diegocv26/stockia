import { Button, Card, Col, Container, Navbar, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import BrandLogo from '../../components/BrandLogo.jsx';
import ThemeToggle from '../../components/ThemeToggle.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const FEATURES = [
  ['bi-box-seam', 'primary', 'Inventario al día', 'Productos, categorías, imágenes y alertas cuando el stock se está acabando.'],
  ['bi-currency-exchange', 'success', 'Precios en bolívares', 'Cargas el precio en dólares y Stockia lo convierte con la tasa del día.'],
  ['bi-cart-check', 'info', 'Punto de venta ágil', 'Busca por nombre o SKU y cobra en Pago Móvil, Zelle, efectivo y más.'],
  ['bi-people', 'warning', 'Clientes con historial', 'Cédula, teléfono y todo lo que ha comprado cada persona.'],
  ['bi-wallet2', 'danger', 'Fiado bajo control', 'Registra deudas, abonos y vencimientos sin perder la cuenta.'],
  ['bi-graph-up-arrow', 'primary', 'Caja y reportes', 'Cierre diario por forma de pago y exportación a CSV y PDF.'],
];

const STEPS = [
  ['Crea tu tienda', 'Regístrate en un minuto y entra a tu panel.'],
  ['Carga tu inventario', 'Agrega productos con su precio en dólares y una foto.'],
  ['Vende sin hacer cuentas', 'Stockia calcula los bolívares y descuenta el stock por ti.'],
];

function Preview() {
  const bars = [38, 62, 45, 80, 55, 92, 70];
  return (
    <div className="st-preview" aria-hidden="true">
      <div className="st-preview-bar"><span /><span /><span /></div>
      <div className="p-4">
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <div className="small text-body-secondary">Ventas de hoy (ejemplo)</div>
            <div className="fs-2 fw-bold lh-1">$ 128,50</div>
            <div className="small text-body-secondary mt-1">≈ Bs 115.650,00</div>
          </div>
          <span className="st-rate-chip d-inline-flex"><i className="bi bi-currency-exchange" /> Tasa del día</span>
        </div>
        <div className="st-bars mb-4">
          {bars.map((h, i) => <span key={i} style={{ height: `${h}%` }} />)}
        </div>
        <Row className="g-2">
          <Col xs={6}>
            <div className="d-flex align-items-center gap-2 p-2 rounded-3 border">
              <div className="st-icon-box st-icon-warning" style={{ width: '2.2rem', height: '2.2rem' }}><i className="bi bi-exclamation-triangle" /></div>
              <div className="small lh-sm"><strong>3</strong><br />stock bajo</div>
            </div>
          </Col>
          <Col xs={6}>
            <div className="d-flex align-items-center gap-2 p-2 rounded-3 border">
              <div className="st-icon-box st-icon-success" style={{ width: '2.2rem', height: '2.2rem' }}><i className="bi bi-receipt" /></div>
              <div className="small lh-sm"><strong>14</strong><br />ventas hoy</div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default function Landing() {
  const { user } = useAuth();

  return (
    <>
      <Navbar sticky="top" className="st-navbar py-2">
        <Container>
          <BrandLogo />
          <div className="d-none d-md-flex gap-4">
            <a href="#funciones" className="st-link-muted">Funciones</a>
            <a href="#como-funciona" className="st-link-muted">Cómo funciona</a>
          </div>
          <div className="d-flex align-items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Button as={Link} to="/app" size="sm">Ir al panel</Button>
            ) : (
              <>
                <Button as={Link} to="/login" variant="outline-primary" size="sm" className="d-none d-sm-inline-block">Iniciar sesión</Button>
                <Button as={Link} to="/registro" size="sm">Crear cuenta</Button>
              </>
            )}
          </div>
        </Container>
      </Navbar>

      <header className="st-hero">
        <Container>
          <Row className="align-items-center g-5">
            <Col lg={6}>
              <span className="st-pill mb-3"><i className="bi bi-lightning-charge-fill me-1" /> Precios en bolívares, siempre al día</span>
              <h1 className="st-hero-title mb-3">
                Inventario y ventas para tu tienda, <span className="st-gradient-text">sin hacer cuentas a mano</span>
              </h1>
              <p className="lead text-body-secondary mb-4">
                Registra tus productos en dólares y Stockia calcula el precio en bolívares con la tasa del día.
                Controla inventario, ventas, clientes y caja desde un solo panel.
              </p>
              <div className="d-flex flex-wrap gap-2">
                <Button as={Link} to={user ? '/app' : '/registro'} size="lg">{user ? 'Ir al panel' : 'Crear mi tienda'}</Button>
                {!user && <Button as={Link} to="/login" size="lg" variant="outline-primary">Iniciar sesión</Button>}
              </div>
            </Col>
            <Col lg={6}><Preview /></Col>
          </Row>
        </Container>
      </header>

      <section id="funciones" className="py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold">Todo lo que tu negocio necesita</h2>
            <p className="text-body-secondary mb-0">Un panel pensado para tiendas que venden en dólares y cobran en bolívares.</p>
          </div>
          <Row className="g-4">
            {FEATURES.map(([icon, variant, title, text]) => (
              <Col md={6} lg={4} key={title}>
                <Card className="h-100">
                  <Card.Body className="p-4">
                    <div className={`st-icon-box st-icon-${variant} mb-3`}><i className={`bi ${icon}`} /></div>
                    <h3 className="h5 fw-bold">{title}</h3>
                    <p className="text-body-secondary mb-0">{text}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section id="como-funciona" className="py-5">
        <Container>
          <h2 className="fw-bold text-center mb-5">Cómo funciona</h2>
          <Row className="g-4">
            {STEPS.map(([title, text], i) => (
              <Col md={4} key={title} className="text-center">
                <div className="st-step-num mx-auto mb-3">{i + 1}</div>
                <h3 className="h5 fw-bold">{title}</h3>
                <p className="text-body-secondary mb-0">{text}</p>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section className="py-5">
        <Container>
          <div className="st-cta text-center">
            <h2 className="fw-bold mb-2">Pon tu tienda en orden hoy</h2>
            <p className="opacity-75 mb-4">Crea tu cuenta y empieza a cargar tu inventario.</p>
            <Button as={Link} to={user ? '/app' : '/registro'} variant="light" size="lg" className="fw-semibold">
              {user ? 'Ir al panel' : 'Crear mi tienda'}
            </Button>
          </div>
        </Container>
      </section>

      <footer className="py-4 border-top">
        <Container className="d-flex flex-wrap justify-content-between gap-2 small text-body-secondary">
          <span>© {new Date().getFullYear()} Stockia · Proyecto de portafolio</span>
          <a href="https://github.com/diegocv26/stockia" target="_blank" rel="noreferrer" className="st-link-muted">
            <i className="bi bi-github me-1" /> Código en GitHub
          </a>
        </Container>
      </footer>
    </>
  );
}
