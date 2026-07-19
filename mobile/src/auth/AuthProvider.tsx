import { useEffect, useState, type ReactNode } from 'react';
import { fetchMe, login as loginRequest, logout as logoutRequest } from './api';
import { getToken, setToken, clearToken } from './tokenStorage';
import { setUnauthorizedHandler } from './authEvents';
import type { AuthUser } from './types';
import { AuthContext, type AuthStatus } from './authContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkStoredSession() {
      const token = await getToken();
      if (!token) {
        if (!cancelled) setStatus('unauthenticated');
        return;
      }

      try {
        const me = await fetchMe();
        if (!cancelled) {
          setUser(me);
          setStatus('authenticated');
        }
      } catch {
        await clearToken();
        if (!cancelled) setStatus('unauthenticated');
      }
    }

    checkStoredSession();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setStatus('unauthenticated');
    });
    return () => setUnauthorizedHandler(() => {});
  }, []);

  async function login(username: string, password: string) {
    const result = await loginRequest(username, password);
    await setToken(result.token);
    setUser({ id: result.id, username: result.username });
    setStatus('authenticated');
  }

  async function logout() {
    await logoutRequest();
    await clearToken();
    setUser(null);
    setStatus('unauthenticated');
  }

  return <AuthContext.Provider value={{ status, user, login, logout }}>{children}</AuthContext.Provider>;
}
