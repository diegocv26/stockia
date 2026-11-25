import { Navigate, useLocation } from 'react-router-dom';
import FullPageLoader from '../components/FullPageLoader.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <FullPageLoader message="Verificando tu sesión…" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}
