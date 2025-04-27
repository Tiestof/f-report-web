import { useEffect, useState } from 'react';

export default function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const rut = localStorage.getItem('usuarioRut');
    setIsAuthenticated(!!rut);
  }, []);

  return isAuthenticated;
}
