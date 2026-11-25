import { Spinner } from 'react-bootstrap';
import { useDelayedFlag } from '../hooks/useDelayedFlag.js';

export default function FullPageLoader({ message = 'Cargando…' }) {
  const slow = useDelayedFlag(true, 4000);
  return (
    <div className="st-fullpage">
      <Spinner animation="border" variant="primary" />
      <p className="mt-3 mb-0 text-body-secondary">{message}</p>
      {slow && (
        <p className="small text-body-secondary mt-2 px-3 text-center">
          El servidor gratuito se está despertando. Puede tardar hasta un minuto…
        </p>
      )}
    </div>
  );
}
