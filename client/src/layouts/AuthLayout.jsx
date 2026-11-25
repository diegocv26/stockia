import { Link } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';

const POINTS = [
  ['bi-currency-exchange', 'Precios en bolívares con la tasa del día'],
  ['bi-box-seam', 'Inventario que se descuenta con cada venta'],
  ['bi-people', 'Historial de compras por cliente'],
];

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="st-auth">
      <aside className="st-auth-aside">
        <BrandLogo />
        <div>
          <h2 className="display-6 fw-bold mb-3">Tu tienda en orden, y en bolívares.</h2>
          <p className="opacity-75 mb-4">Inventario, ventas y precios que se actualizan solos.</p>
          <ul className="list-unstyled d-grid gap-3 mb-0">
            {POINTS.map(([icon, text]) => (
              <li key={text} className="d-flex align-items-center gap-3">
                <i className={`bi ${icon} fs-5`} />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <small className="opacity-75">© {new Date().getFullYear()} Stockia</small>
      </aside>

      <main className="st-auth-main">
        <div className="position-absolute top-0 end-0 p-3"><ThemeToggle /></div>
        <div className="st-auth-card">
          <Link to="/" className="st-link-muted small d-inline-block mb-4">
            <i className="bi bi-arrow-left me-1" />
            Volver al inicio
          </Link>
          <h1 className="h3 fw-bold">{title}</h1>
          <p className="text-body-secondary mb-4">{subtitle}</p>
          {children}
          {footer && <p className="text-center text-body-secondary mt-4 mb-0">{footer}</p>}
        </div>
      </main>
    </div>
  );
}
