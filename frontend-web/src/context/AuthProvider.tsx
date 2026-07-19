import { useEffect, useState, type ReactNode } from 'react';
import { fetchMe, login as loginRequest, logout as logoutRequest } from '../api/auth';
import type { AuthUser } from '../types/user';
import { AuthContext, type AuthStatus } from './authContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    fetchMe()
      .then((me) => {
        setUser(me);
        setStatus('authenticated');
      })
      .catch(() => {
        setStatus('unauthenticated');
      });
  }, []);

  async function login(username: string, password: string) {
    const me = await loginRequest(username, password);
    setUser(me);
    setStatus('authenticated');
  }

  async function logout() {
    await logoutRequest().catch(() => {});
    setUser(null);
    setStatus('unauthenticated');
  }

  return <AuthContext.Provider value={{ status, user, login, logout }}>{children}</AuthContext.Provider>;
}
