import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Supervisor() {
  const isAuthenticated = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const nombre = localStorage.getItem('usuarioNombre');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background-dark text-white">
      <h1 className="text-4xl font-bold mb-6">Bienvenido Tecnico</h1>
      <p className="text-lg">Usuario: {nombre}</p>
    </div>
  );
}