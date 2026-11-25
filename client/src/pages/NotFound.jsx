import { Link } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo.jsx';

export default function NotFound() {
  return (
    <div className="st-fullpage text-center px-3">
      <BrandLogo />
      <p className="display-1 fw-bold mt-4 mb-0 st-gradient-text">404</p>
      <h1 className="h4 mb-2">Esta página no existe</h1>
      <p className="text-body-secondary">Puede que el enlace esté mal escrito o que la página se haya movido.</p>
      <Link to="/" className="btn btn-primary">Volver al inicio</Link>
    </div>
  );
}
