import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AUTH_KEY, endpoints, getStoredAuth } from '../api/client';

const AuthContext = createContext(null);

/** Reads the payload of a JWT without verifying it (the gateway does the verifying). */
function decodeJwt(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(escape(atob(payload))));
  } catch {
    return null;
  }
}

function isExpired(token) {
  const exp = decodeJwt(token)?.exp;
  return exp ? exp * 1000 < Date.now() : false;
}

export function isAdmin(user) {
  return String(user?.role || '').toUpperCase().replace(/^ROLE_/, '') === 'ADMIN';
}

function loadInitialUser() {
  const stored = getStoredAuth();
  if (!stored?.token || isExpired(stored.token)) {
    localStorage.removeItem(AUTH_KEY);
    return null;
  }
  const claims = decodeJwt(stored.token) || {};
  return {
    ...stored,
    role: String(claims.role || stored.role || 'CUSTOMER').toUpperCase().replace(/^ROLE_/, ''),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadInitialUser);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
  }, []);

  const login = useCallback(async (username, password) => {
    const { data } = await endpoints.login({ username, password });
    const claims = decodeJwt(data.token) || {};
    const next = {
      token: data.token,
      username: data.username || claims.sub || username,
      role: String(data.role || claims.role || 'CUSTOMER').toUpperCase().replace(/^ROLE_/, ''),
      // Only present once the login response includes the user id (see README, "Backend notes").
      id: data.userId ?? data.id ?? claims.userId ?? null,
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(next));
    setUser(next);
    return next;
  }, []);

  const register = useCallback(async (form) => {
    await endpoints.register(form);
    return login(form.username, form.password);
  }, [login]);

  // The axios interceptor fires this when the gateway answers 401 for a stored token.
  useEffect(() => {
    const onUnauthorized = () => logout();
    window.addEventListener('fd:unauthorized', onUnauthorized);
    return () => window.removeEventListener('fd:unauthorized', onUnauthorized);
  }, [logout]);

  // Sign out automatically when the token expires.
  useEffect(() => {
    if (!user?.token) return undefined;
    const exp = decodeJwt(user.token)?.exp;
    if (!exp) return undefined;
    const ms = exp * 1000 - Date.now();
    if (ms <= 0) {
      logout();
      return undefined;
    }
    const id = setTimeout(logout, Math.min(ms, 2 ** 31 - 1));
    return () => clearTimeout(id);
  }, [user, logout]);

  const value = useMemo(() => ({ user, login, register, logout }), [user, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
