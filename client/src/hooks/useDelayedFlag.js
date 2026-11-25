import { useEffect, useState } from 'react';

// Devuelve true si "active" lleva más de "delay" ms encendido.
// Sirve para mostrar el aviso "el servidor está despertando" solo cuando tarda de verdad.
export function useDelayedFlag(active, delay = 4000) {
  const [elapsed, setElapsed] = useState(false);

  useEffect(() => {
    if (!active) return undefined;
    const id = setTimeout(() => setElapsed(true), delay);
    return () => {
      clearTimeout(id);
      setElapsed(false);
    };
  }, [active, delay]);

  return active && elapsed;
}
