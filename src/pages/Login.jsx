import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../config';

export default function Login() {
  const [rut, setRut] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const cleanRut = rut.replace(/\D/g, '');

    if (!cleanRut || !clave) {
      setError('Todos los campos son obligatorios');
      return;
    }

    try {
      const res = await fetch(`${config.apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rut: cleanRut, clave }),
      });

      const data = await res.json();
      console.log('Respuesta de la API:', data);

      if (data.usuario) {
        const { rut, nombre, descripcion_usuario } = data.usuario;

        // Guardamos datos en localStorage para usarlos en otras páginas
        localStorage.setItem('usuarioRut', rut);
        localStorage.setItem('usuarioNombre', nombre);

        console.log('Perfil:', descripcion_usuario);

        if (descripcion_usuario === 'SUPERVISOR') {
          navigate('/supervisor');
        } else if (descripcion_usuario === 'TÉCNICO') {
          navigate('/tecnico');
        } else {
          setError('Perfil no reconocido.');
        }
      } else {
        setError('Usuario o clave incorrectos');
      }
    } catch (err) {
      console.error('Error al conectar con la API:', err);
      setError('Error al conectar con el servidor');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background-dark p-4">
      <h1 className="text-4xl font-bold mb-6 text-white">F-REPORT</h1>
      <form onSubmit={handleLogin} className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <label className="block mb-1 text-gray-700 font-semibold">RUT</label>
        <input
          type="text"
          placeholder="Ej: 123456789"
          value={rut}
          onChange={(e) => setRut(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
        />
        <label className="block mb-1 text-gray-700 font-semibold">Clave</label>
        <input
          type="password"
          placeholder="********"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <button type="submit" className="w-full bg-button-orange hover:bg-orange-600 text-white p-2 rounded font-bold shadow">
          LOG IN
        </button>
      </form>
    </div>
  );
}
