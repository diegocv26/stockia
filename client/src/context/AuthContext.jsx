import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.js';
import { tokenStorage, UNAUTHORIZED_EVENT } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  // Si hay token guardado, hay que verificarlo con el servidor antes de decidir qué mostrar
  const [initializing, setInitializing] = useState(() => Boolean(tokenStorage.get()));

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    queryClient.clear(); // no dejar datos de una sesión en la siguiente
  }, [queryClient]);

  // El interceptor de axios avisa cuando el servidor rechaza la sesión
  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, logout);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout);
  }, [logout]);

  // Restaura la sesión al abrir la app
  useEffect(() => {
    if (!tokenStorage.get()) return undefined;
    let cancelled = false;
    authApi
      .me()
      .then((me) => { if (!cancelled) setUser(me); })
      .catch(() => { /* 401: el interceptor ya limpió la sesión. Otro error: se muestra el login */ })
      .finally(() => { if (!cancelled) setInitializing(false); });
    return () => { cancelled = true; };
  }, []);

  const startSession = useCallback(({ token, user: me }) => {
    tokenStorage.set(token);
    setUser(me);
    return me;
  }, []);

  const login = useCallback((credentials) => authApi.login(credentials).then(startSession), [startSession]);
  const register = useCallback((payload) => authApi.register(payload).then(startSession), [startSession]);

  const value = useMemo(
    () => ({ user, initializing, login, register, logout }),
    [user, initializing, login, register, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
