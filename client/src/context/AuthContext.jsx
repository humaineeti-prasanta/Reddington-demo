import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

const AuthContext = createContext(null);

// consents is a map: { [purposeId]: status }
const toConsentMap = (rows) =>
  Object.fromEntries((rows || []).map((r) => [r.purposeId, r.status]));

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [consents, setConsents] = useState({});
  const [reconsentRequired, setReconsentRequired] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshConsents = useCallback(async () => {
    try {
      const { data } = await api.get('/consents/me');
      setConsents(toConsentMap(data));
      return toConsentMap(data);
    } catch {
      setConsents({});
      return {};
    }
  }, []);

  const loadMe = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      setReconsentRequired(data.reconsentRequired);
      await refreshConsents();
    } catch {
      setUser(null);
      setConsents({});
      setReconsentRequired(false);
    } finally {
      setLoading(false);
    }
  }, [refreshConsents]);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    setUser(data.user);
    setReconsentRequired(false);
    setConsents({});
    return data.user;
  }, []);

  const login = useCallback(async (payload) => {
    const { data } = await api.post('/auth/login', payload);
    setUser(data.user);
    setReconsentRequired(data.reconsentRequired);
    await refreshConsents();
    return data;
  }, [refreshConsents]);

  const logout = useCallback(async () => {
    await api.post('/auth/logout');
    setUser(null);
    setConsents({});
    setReconsentRequired(false);
  }, []);

  const value = {
    user,
    consents,
    reconsentRequired,
    setReconsentRequired,
    loading,
    register,
    login,
    logout,
    refreshConsents,
    hasConsent: (purposeId) => consents[purposeId] === 'granted',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
