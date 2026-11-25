import { Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getInitials, ROLE_LABELS } from '../utils/format.js';
import ThemeToggle from './ThemeToggle.jsx';

export default function Topbar({ collapsed, onOpenMenu, onToggleCollapse }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="st-topbar">
      <button type="button" className="st-icon-btn d-lg-none" onClick={onOpenMenu} aria-label="Abrir menú">
        <i className="bi bi-list" />
      </button>
      <button
        type="button"
        className="st-icon-btn d-none d-lg-inline-flex"
        onClick={onToggleCollapse}
        aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
      >
        <i className={`bi ${collapsed ? 'bi-layout-sidebar' : 'bi-layout-sidebar-inset'}`} />
      </button>

      <div className="ms-auto d-flex align-items-center gap-2">
        {/* Se conectará a la tasa real en la fase 3 */}
        <span className="st-rate-chip d-none d-sm-inline-flex" title="Se conectará a la tasa del día en la fase 3">
          <i className="bi bi-currency-exchange" /> Tasa: —
        </span>
        <ThemeToggle />
        <Dropdown align="end">
          <Dropdown.Toggle as="button" type="button" className="st-user-toggle" id="user-menu">
            <span className="st-avatar">{getInitials(user.name)}</span>
            <span className="d-none d-md-block text-start lh-sm">
              <span className="d-block fw-semibold small">{user.name}</span>
              <span className="d-block text-body-secondary" style={{ fontSize: '0.75rem' }}>
                {ROLE_LABELS[user.role]}
              </span>
            </span>
            <i className="bi bi-chevron-down small d-none d-md-block" />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Header>{user.email}</Dropdown.Header>
            <Dropdown.Item onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-2" />
              Cerrar sesión
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  );
}
