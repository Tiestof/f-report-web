import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Tecnico() {
  const isAuthenticated = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Tecnico.jsx montado');
    console.log('¿Autenticado?:', isAuthenticated);

    if (isAuthenticated === false) {
      console.log('No autenticado, redirigiendo a login');
      navigate('/');
    } else if (isAuthenticated === true) {
      console.log('Usuario autenticado, mostrando Técnico');
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-dark text-white">
        <p className="text-lg">Verificando autenticación...</p>
      </div>
    );
  }

  const nombre = localStorage.getItem('usuarioNombre');
  const rut = localStorage.getItem('usuarioRut');
  console.log('Datos usuario - Nombre:', nombre, '| Rut:', rut);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background-dark text-white">
      <h1 className="text-4xl font-bold mb-6">Bienvenido Técnico</h1>
      <p className="text-lg">Usuario: {nombre}</p>
    </div>
  );
}
