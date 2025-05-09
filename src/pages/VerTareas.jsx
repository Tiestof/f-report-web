import { useEffect, useState } from 'react';
import config from '../config';
import useAuth from '../hooks/useAuth';

export default function VerTareas() {
  const isAuthenticated = useAuth();
  const rut = localStorage.getItem('usuarioRut');
  const [tareas, setTareas] = useState([]);

  useEffect(() => {
    const cargarTareas = async () => {
      const res = await fetch(`${config.apiUrl}/reportes`);
      const data = await res.json();

      const hoy = new Date();
      const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

      const filtradas = data.filter(r => {
        const fecha = new Date(r.fecha_reporte);
        const fechaSinHora = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
        return String(r.rut_usuario) === rut &&
               r.id_estado_servicio === 4 &&
               fechaSinHora.getTime() === hoySinHora.getTime();
      });

      const ahoraMin = new Date().getHours() * 60 + new Date().getMinutes();

      const tareaCercana = filtradas.reduce((closest, actual) => {
        const [h, m] = actual.hora_inicio.split(':').map(Number);
        const actualMin = h * 60 + m;
        if (!closest) return actual;
        const [ch, cm] = closest.hora_inicio.split(':').map(Number);
        const closestMin = ch * 60 + cm;
        return Math.abs(actualMin - ahoraMin) < Math.abs(closestMin - ahoraMin) ? actual : closest;
      }, null);

      setTareas(filtradas.map(t => ({ ...t, esCercana: t.id_reporte === tareaCercana?.id_reporte })));
    };

    cargarTareas();
  }, [rut]);

  if (isAuthenticated === null) return <div className="p-6">Verificando autenticación...</div>;
  if (!isAuthenticated) return <div className="p-6 text-red-600 font-bold">Acceso no autorizado</div>;

  return (
    <div className="bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Tareas asignadas para hoy</h1>
      {tareas.length === 0 ? (
        <p>No tienes tareas asignadas para hoy.</p>
      ) : (
        <ul className="space-y-4">
          {tareas.map(t => (
            <li key={t.id_reporte} className={`border p-4 rounded shadow ${t.esCercana ? 'bg-yellow-300' : 'bg-yellow-100'}`}>
              <p className="font-semibold">{t.hora_inicio} - {t.direccion}</p>
              <p className="text-sm">{t.comentario || 'Sin comentarios.'}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
