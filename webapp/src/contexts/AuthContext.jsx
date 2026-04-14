import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// Admin credentials
const ADMIN_EMAIL = 'bijjambhargav@gmail.com';
const ADMIN_PASS  = '985600@Bh';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const s = localStorage.getItem('so_user');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  const login = (email, password) => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      const u = { email, role: 'admin', name: 'Admin' };
      setUser(u);
      localStorage.setItem('so_user', JSON.stringify(u));
      return { success: true, role: 'admin' };
    }
    const customers = JSON.parse(localStorage.getItem('so_customers') || '[]');
    const found = customers.find(c => c.email === email && c.password === password);
    if (found) {
      const u = { email: found.email, role: 'customer', name: found.name };
      setUser(u);
      localStorage.setItem('so_user', JSON.stringify(u));
      return { success: true, role: 'customer' };
    }
    return { success: false, error: 'Invalid email or password.' };
  };

  const register = (name, email, password) => {
    const customers = JSON.parse(localStorage.getItem('so_customers') || '[]');
    if (customers.find(c => c.email === email)) {
      return { success: false, error: 'This email is already registered.' };
    }
    customers.push({ name, email, password });
    localStorage.setItem('so_customers', JSON.stringify(customers));
    const u = { email, role: 'customer', name };
    setUser(u);
    localStorage.setItem('so_user', JSON.stringify(u));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('so_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
