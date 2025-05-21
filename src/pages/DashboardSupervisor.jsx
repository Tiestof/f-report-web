import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import config from '../config';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function DashboardSupervisor() {
  const isAuthenticated = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
  if (isAuthenticated === false) return navigate('/');

  const actualizarDatos = () => {
    fetch(`${config.apiUrl}/estadisticas/reportes-no-finalizados-hoy`)
      .then(res => res.json())
      .then(data => setReportesNoFinalizados(data[0]?.total || 0));

    fetch(`${config.apiUrl}/estadisticas/servicios-del-mes`)
      .then(res => res.json())
      .then(data => setServiciosDelMes(data[0]?.total || 0));

    fetch(`${config.apiUrl}/estadisticas/servicios-por-estado`)
      .then(res => res.json())
      .then(data => {
        const filtrado = data.filter(item => item.id_estado !== 5);
        setServiciosPorEstado(filtrado);
      });

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

        let carga = Object.values(fechasMap);
        carga.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        const hoy = new Date();
        carga = carga.filter(item => {
          const fecha = new Date(item.fecha);
          const diff = (hoy - fecha) / (1000 * 60 * 60 * 24);
          return diff <= 30;
        });

        setCargaTecnicos(carga);
        setTecnicos(Array.from(tecnicosSet));
      });

    fetch(`${config.apiUrl}/estadisticas/actividades-hoy`)
      .then(res => res.json())
      .then(data => setActividadesHoy(data));
  };

  actualizarDatos();
  const intervalo = setInterval(actualizarDatos, 30000);

  return () => clearInterval(intervalo);
}, [isAuthenticated]);

  if (isAuthenticated === null) return <div className="p-6">Verificando autenticación...</div>;

  return (
    <div className="px-4 py-6 bg-gray-100 min-h-screen w-full max-w-full overflow-x-hidden">
      <h1 className="text-3xl font-bold text-gray-700 mb-6">Dashboard</h1>
      <p className="text-lg font-bold text-gray-600 mb-6">Bienvenido, {localStorage.getItem('usuarioNombre')}</p>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="bg-white p-4 rounded shadow flex flex-col justify-center items-center h-40 w-full max-w-full">
        <h2 className="text-xl font-bold mb-2 text-center">Reportes No Finalizados Hoy</h2>
        <p className="text-4xl font-bold text-red-600">{reportesNoFinalizados}</p>
      </div>
      <div className="bg-white p-4 rounded shadow flex flex-col justify-center items-center h-40 w-full max-w-full">
        <h2 className="text-xl font-bold mb-2 text-center">Total Servicios del Mes</h2>
        <p className="text-4xl font-bold text-green-600">{serviciosDelMes}</p>
      </div>
    </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Carga de Técnicos (Mes actual)</h2>
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

      <div className="bg-white p-6 rounded shadow mt-8">
        <h2 className="text-xl font-bold mb-4">Resumen de Actividades de Técnicos - Hoy</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border">
            <thead className="bg-gray-100 text-xs uppercase font-medium text-gray-600">
              <tr>
                <th className="px-4 py-2 border">Técnico</th>
                <th className="px-4 py-2 border">Cliente</th>
                <th className="px-4 py-2 border">Hora Inicio</th>
                <th className="px-4 py-2 border">Estado</th>
              </tr>
            </thead>
            <tbody>
              {actividadesHoy.map((act, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2">{act.nombre_tecnico}</td>
                  <td className="px-4 py-2">{act.nombre_cliente || '-'}</td>
                  <td className="px-4 py-2">{act.hora_inicio || '-'}</td>
                  <td className="px-4 py-2">{act.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
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


    </div>
  );
}
