import { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import config from '../config';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

export default function Tecnico() {
  const isAuthenticated = useAuth();
  const [datosPorEstado, setDatosPorEstado] = useState({});
  const [asignadas, setAsignadas] = useState(0);
  const [estados, setEstados] = useState([]);
  const rut = localStorage.getItem('usuarioRut');
  const nombre = localStorage.getItem('usuarioNombre');

  useEffect(() => {
    if (!rut) return;

    fetch(`${config.apiUrl}/estados-servicio`)
      .then(res => res.json())
      .then(setEstados);

    fetch(`${config.apiUrl}/reportes`)
      .then(res => res.json())
      .then(data => {
        const ahora = new Date();
        const hoy = ahora.toISOString().split('T')[0];

        const filtrados = data.filter(r =>
          r.rut_usuario === rut &&
          new Date(r.fecha_reporte).getMonth() === ahora.getMonth() &&
          new Date(r.fecha_reporte).getFullYear() === ahora.getFullYear()
        );

        const conteo = {};
        filtrados.forEach(r => {
          const desc = r.id_estado_servicio;
          conteo[desc] = (conteo[desc] || 0) + 1;
        });
        setDatosPorEstado(conteo);

        const asignadasActual = data.filter(r =>
          r.rut_usuario === rut &&
          r.id_estado_servicio === 4 &&
          new Date(r.fecha_reporte).toISOString().split('T')[0] === hoy
        );
        setAsignadas(asignadasActual.length);
      });
  }, [rut]);

  if (isAuthenticated === null) {
    return <div className="p-6">Verificando autenticación...</div>;
  }
  if (!isAuthenticated) {
    return <div className="p-6 text-red-600 font-bold">Acceso no autorizado</div>;
  }

  const chartData = {
    labels: Object.keys(datosPorEstado).map(id => {
      const e = estados.find(e => e.id_estado_servicio === parseInt(id));
      return e ? e.descripcion : `Estado ${id}`;
    }),
    datasets: [
      {
        label: 'Servicios por Estado (mes actual)',
        data: Object.values(datosPorEstado),
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderRadius: 4
      }
    ]
  };

  return (
    <div className="flex-1 p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Bienvenido, {nombre}</h1>

      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold text-purple-700 mb-2">Tareas Asignadas para hoy</h2>
        <p className="text-4xl font-bold text-center text-purple-900">{asignadas}</p>
      </div>

      <div className="bg-white p-4 rounded shadow max-w-xl">
        <Bar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } }
          }}
          height={250}
        />
      </div>
    </div>
  );
}
