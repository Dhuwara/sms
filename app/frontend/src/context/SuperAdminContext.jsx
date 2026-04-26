import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const saApi = axios.create({ baseURL: BASE, withCredentials: true });

const SuperAdminContext = createContext(null);

export const SuperAdminProvider = ({ children }) => {
  const [superAdmin, setSuperAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    saApi.get('/api/superadmin/auth/me')
      .then(res => setSuperAdmin(res.data.data))
      .catch(() => setSuperAdmin(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await saApi.post('/api/superadmin/auth/login', { email, password });
    setSuperAdmin(res.data.data);
    return res.data.data;
  };

  const logout = async () => {
    await saApi.post('/api/superadmin/auth/logout');
    setSuperAdmin(null);
  };

  return (
    <SuperAdminContext.Provider value={{ superAdmin, loading, login, logout }}>
      {children}
    </SuperAdminContext.Provider>
  );
};

export const useSuperAdmin = () => useContext(SuperAdminContext);

export { saApi };
