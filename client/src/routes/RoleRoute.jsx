import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Solo oculta la pantalla: la seguridad real la aplica el backend con requireRole
export default function RoleRoute({ roles, children }) {
  const { user } = useAuth();
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="text-center py-5">
        <div className="st-icon-box st-icon-danger mx-auto mb-3"><i className="bi bi-shield-lock" /></div>
        <h1 className="h4">Sin acceso</h1>
        <p className="text-body-secondary">Tu rol no tiene permiso para ver esta sección.</p>
        <Link to="/app" className="btn btn-primary">Volver al panel</Link>
      </div>
    );
  }
  return children;
}
