import { useEffect, useState } from 'react';
import { Offcanvas } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import SidebarContent from '../components/Sidebar.jsx';
import Topbar from '../components/Topbar.jsx';

const COLLAPSE_KEY = 'stockia-sidebar-collapsed';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(COLLAPSE_KEY) === '1'; } catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0'); } catch { /* sin almacenamiento */ }
  }, [collapsed]);

  return (
    <div className="st-shell">
      <aside className={`st-sidebar d-none d-lg-flex ${collapsed ? 'collapsed' : ''}`}>
        <SidebarContent collapsed={collapsed} />
      </aside>

      <Offcanvas show={mobileOpen} onHide={() => setMobileOpen(false)} className="st-offcanvas d-lg-none">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title as="div" className="st-brand">Stockia</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column p-0">
          <SidebarContent showBrand={false} onNavigate={() => setMobileOpen(false)} />
        </Offcanvas.Body>
      </Offcanvas>

      <div className="st-main">
        <Topbar
          collapsed={collapsed}
          onOpenMenu={() => setMobileOpen(true)}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />
        <main className="st-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
