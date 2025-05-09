import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import config from '../config';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function DashboardSupervisor() {
  const isAuthenticated = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated === false) navigate('/');
  }, [isAuthenticated]);

  const [reportesNoFinalizados, setReportesNoFinalizados] = useState(0);
  const [serviciosDelMes, setServiciosDelMes] = useState(0);
  const [serviciosPorEstado, setServiciosPorEstado] = useState([]);
  const [cargaTecnicos, setCargaTecnicos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);

  useEffect(() => {
    fetch(`${config.apiUrl}/estadisticas/reportes-no-finalizados-hoy`)
      .then(res => res.json())
      .then(data => setReportesNoFinalizados(data[0]?.total || 0));

    fetch(`${config.apiUrl}/estadisticas/servicios-del-mes`)
      .then(res => res.json())
      .then(data => setServiciosDelMes(data[0]?.total || 0));

    fetch(`${config.apiUrl}/estadisticas/servicios-por-estado`)
      .then(res => res.json())
      .then(setServiciosPorEstado);

    fetch(`${config.apiUrl}/estadisticas/carga-tecnicos`)
      .then(res => res.json())
      .then(data => {
        const fechasMap = {};
        const tecnicosSet = new Set();
        data.forEach(item => {
          tecnicosSet.add(item.nombre);
          if (!fechasMap[item.fecha]) fechasMap[item.fecha] = { fecha: item.fecha };
          fechasMap[item.fecha][item.nombre] = item.total_servicios;
        });
        setCargaTecnicos(Object.values(fechasMap));
        setTecnicos(Array.from(tecnicosSet));
      });
  }, []);

  if (isAuthenticated === null) return <div className="p-6">Verificando autenticación...</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-700 mb-6">Dashboard</h1>
      <p className="text-lg text-gray-600 mb-6">Bienvenido, {localStorage.getItem('usuarioNombre')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-2">Reportes No Finalizados Hoy</h2>
          <p className="text-4xl font-bold text-red-600">{reportesNoFinalizados}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-2">Total Servicios del Mes</h2>
          <p className="text-4xl font-bold text-green-600">{serviciosDelMes}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Servicios por Estado</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={serviciosPorEstado}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="estado" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Carga de Técnicos (últimos días)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={cargaTecnicos}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis />
            <Tooltip />
            {tecnicos.map((tec, index) => (
              <Bar key={tec} dataKey={tec} stackId="a" fill={`hsl(${index * 60}, 70%, 50%)`} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
