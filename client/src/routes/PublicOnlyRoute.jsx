import { Navigate, useLocation } from 'react-router-dom';
import FullPageLoader from '../components/FullPageLoader.jsx';
import { useAuth } from '../context/AuthContext.jsx';

// Login y registro: si ya hay sesión, te manda al panel (o a la página que intentabas abrir)
export default function PublicOnlyRoute({ children }) {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <FullPageLoader message="Verificando tu sesión…" />;
  if (user) return <Navigate to={location.state?.from?.pathname || '/app'} replace />;
  return children;
}
