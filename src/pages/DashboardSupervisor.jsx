import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import config from '../config';

export default function DashboardSupervisor() {
    const [reportesNoFinalizados, setReportesNoFinalizados] = useState(0);
    const [serviciosDelMes, setServiciosDelMes] = useState(0);
    const [serviciosPorEstado, setServiciosPorEstado] = useState([]);
    const [cargaTecnicos, setCargaTecnicos] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#a0522d', '#8a2be2'];

  useEffect(() => {
    fetch(`${config.apiUrl}/estadisticas/reportes-no-finalizados-hoy`)
    .then(res => res.json())
    .then(data => {
      const total = data[0]?.total || 0;
      setReportesNoFinalizados(total);
    });

    fetch(`${config.apiUrl}/estadisticas/servicios-del-mes`)
    .then(res => res.json())
    .then(data => {
      const total = data[0]?.total || 0;
      setServiciosDelMes(total);
    });
  

    fetch(`${config.apiUrl}/estadisticas/servicios-por-estado`)
      .then(res => res.json())
      .then(data => {
        setServiciosPorEstado(data);
      });

      fetch(`${config.apiUrl}/estadisticas/carga-tecnicos`)
      .then(res => res.json())
      .then(data => {
        console.log('Carga Técnicos API Response:', data);
    
        const fechasMap = {};
        const tecnicosSet = new Set();
    
        data.forEach(item => {
          tecnicosSet.add(item.nombre);
          if (!fechasMap[item.fecha]) {
            fechasMap[item.fecha] = { fecha: item.fecha };
          }
          fechasMap[item.fecha][item.nombre] = item.total_servicios;
        });
    
        const fechasArray = Object.values(fechasMap);
        setCargaTecnicos(fechasArray);
        setTecnicos(Array.from(tecnicosSet));
      });
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Números Representativos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-6 rounded shadow text-center">
          <h2 className="text-xl font-bold text-gray-700 mb-2">Reportes No Finalizados Hoy</h2>
          <p className="text-4xl font-bold text-red-600">{reportesNoFinalizados}</p>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
          <h2 className="text-xl font-bold text-gray-700 mb-2">Servicios del Mes</h2>
          <p className="text-4xl font-bold text-green-600">{serviciosDelMes}</p>
        </div>
      </div>

      {/* Gráficos de Barra */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Servicios por Estado */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-bold text-gray-700 mb-4 text-center">Servicios por Estado</h3>
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

{/* Carga de Técnicos */}
        <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-bold text-gray-700 mb-4 text-center">Carga de Técnicos</h3>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cargaTecnicos}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis />
            <Tooltip />
            {tecnicos.map((tecnico, idx) => (
                <Bar key={idx} dataKey={tecnico} fill={COLORS[idx % COLORS.length]} />
            ))}
            </BarChart>
        </ResponsiveContainer>
        </div>
    </div>
  </div>
);
}
