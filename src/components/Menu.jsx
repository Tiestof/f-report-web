import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Menu({ perfil }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const cerrarSesion = () => {
    console.log('Cerrando sesión...');
    localStorage.clear();
    navigate('/');
  };

  const botonesSupervisor = [
    { label: 'CREAR TAREA', ruta: '/supervisor/crear-tarea' },
    { label: 'VER TAREAS / REPORTES', ruta: '/supervisor/ver-tareas-reportes' },
    { label: 'GESTION USUARIOS', ruta: '/supervisor/usuarios' },
    { label: 'CREACION DE INFORMES', ruta: '/supervisor/informes' },
    { label: 'DASHBOARD', ruta: '/supervisor' },
  ];

  const botonesTecnico = [
    { label: 'CREAR REPORTE', ruta: '/crear-reporte' },
    { label: 'VER TAREAS', ruta: '/mis-tareas' },
    { label: 'DASHBOARD', ruta: '/tecnico' }, // Ajustado
  ];

  const botones = perfil === 'SUPERVISOR' ? botonesSupervisor : botonesTecnico;

  return (
    <>
      {/* Desktop Menu */}
      <div className="hidden md:flex bg-background-dark text-white w-64 h-screen flex-col items-center py-6">
        <h2 className="text-xl font-bold mb-4">F-REPORT</h2>
        <div className="mb-6">
          <div className="rounded-full bg-white text-background-dark w-16 h-16 flex items-center justify-center">
            <span className="text-xl font-bold">{perfil[0]}</span>
          </div>
          <p className="mt-2">{perfil}</p>
        </div>
        {botones.map((btn, idx) => (
          <Link key={idx} to={btn.ruta} className="mb-4 w-48 bg-purple-600 hover:bg-purple-700 text-center py-2 rounded transition">
            {btn.label}
          </Link>
        ))}
        <button onClick={cerrarSesion} className="mt-auto w-48 bg-red-600 hover:bg-red-700 text-center py-2 rounded transition font-bold">
          CERRAR SESIÓN
        </button>
      </div>

      {/* Mobile Menu Toggle */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-background-dark p-4 flex justify-between items-center z-50">
        <h2 className="text-white text-xl font-bold">F-REPORT</h2>
        <button onClick={() => setOpen(!open)} className="text-white text-2xl">
          {open ? '✖️' : '☰'}
        </button>
      </div>

      {/* Mobile Menu Content */}
      {open && (
        <div className="md:hidden fixed top-16 left-0 w-full bg-background-dark text-white z-40 p-4">
          {botones.map((btn, idx) => (
            <Link
              key={idx}
              to={btn.ruta}
              onClick={() => setOpen(false)}
              className="block mb-4 w-full bg-purple-600 hover:bg-purple-700 text-center py-2 rounded transition"
            >
              {btn.label}
            </Link>
          ))}
          <button onClick={cerrarSesion} className="w-full bg-red-600 hover:bg-red-700 text-center py-2 rounded transition font-bold mt-4">
            CERRAR SESIÓN
          </button>
        </div>
      )}
    </>
  );
}
