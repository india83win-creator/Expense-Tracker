import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AuthAPI } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ledger_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [checking, setChecking] = useState(true);

  // Verify the saved token is still valid on app load
  useEffect(() => {
    const token = localStorage.getItem('ledger_token');
    if (!token) {
      setChecking(false);
      return;
    }
    AuthAPI.me()
      .then(({ user }) => {
        setUser(user);
        localStorage.setItem('ledger_user', JSON.stringify(user));
      })
      .catch(() => {
        localStorage.removeItem('ledger_token');
        localStorage.removeItem('ledger_user');
        setUser(null);
      })
      .finally(() => setChecking(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, user } = await AuthAPI.login({ email, password });
    localStorage.setItem('ledger_token', token);
    localStorage.setItem('ledger_user', JSON.stringify(user));
    setUser(user);
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const { token, user } = await AuthAPI.signup({ name, email, password });
    localStorage.setItem('ledger_token', token);
    localStorage.setItem('ledger_user', JSON.stringify(user));
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ledger_token');
    localStorage.removeItem('ledger_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, checking, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
