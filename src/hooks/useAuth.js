import { useEffect, useState } from 'react';

export default function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const rut = localStorage.getItem('usuarioRut');
    if (rut) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  return isAuthenticated;
}
