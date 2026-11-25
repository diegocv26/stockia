import { Link } from 'react-router-dom';

export default function BrandLogo({ to = '/', showText = true }) {
  return (
    <Link to={to} className="st-brand" aria-label="Stockia">
      <span className="st-brand-mark"><i className="bi bi-box-seam-fill" /></span>
      {showText && <span>Stockia</span>}
    </Link>
  );
}
