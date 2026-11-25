import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { visibleGroups } from '../utils/navigation.js';
import BrandLogo from './BrandLogo.jsx';

// Contenido del menú lateral: se reutiliza en escritorio (fijo) y móvil (offcanvas)
export default function SidebarContent({ collapsed = false, showBrand = true, onNavigate }) {
  const { user } = useAuth();
  const groups = visibleGroups(user.role);

  return (
    <>
      {showBrand && (
        <div className="st-sidebar-brand">
          <BrandLogo to="/app" showText={!collapsed} />
        </div>
      )}
      <nav className="st-sidebar-nav" aria-label="Navegación principal">
        {groups.map((group) => (
          <div key={group.title} className="mb-3">
            {!collapsed && <div className="st-group-title">{group.title}</div>}
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                title={collapsed ? item.label : undefined}
                className="st-nav-link"
              >
                <i className={`bi ${item.icon}`} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      {!collapsed && (
        <div className="st-sidebar-footer text-truncate">
          <i className="bi bi-shop me-2" />
          {user.storeName}
        </div>
      )}
    </>
  );
}
