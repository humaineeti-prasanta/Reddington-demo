import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

const AuthContext = createContext(null);

// DPDP consent SDK (loaded in index.html). Tells it who logged in, then shows
// the signup consent screen — the SDK shows it only if this user still has to
// answer. Called without await, so login is never slowed down, and it never
// throws: if the CMP is unreachable the app simply carries on without it.
const connectConsentSdk = async (user) => {
  if (!window.DpdpConsent || !user) return;
  try {
    await window.DpdpConsent.identify({ userId: user.id, email: user.email, name: user.name });
    window.DpdpConsent.showScreen({ displayId: 'SCR-003' });
  } catch (error) {
    console.warn('Consent SDK not ready:', error.message);
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      connectConsentSdk(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    setUser(data.user);
    connectConsentSdk(data.user);
    return data.user;
  }, []);

  const login = useCallback(async (payload) => {
    const { data } = await api.post('/auth/login', payload);
    setUser(data.user);
    connectConsentSdk(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    // Forget the user in the consent SDK first, so nothing of theirs stays on
    // screen even if the logout request fails.
    window.DpdpConsent?.reset();
    await api.post('/auth/logout');
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
