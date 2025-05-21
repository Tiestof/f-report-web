import React, { useState, useEffect } from 'react';
import config from '../config';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function VerTareasReportes() {
  const isAuthenticated = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated === false) navigate('/');
  }, [isAuthenticated]);

  const [tareasHoy, setTareasHoy] = useState([]);
  const [reportes, setReportes] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [filtro, setFiltro] = useState({ desde: '', hasta: '' });

  const obtenerTareasHoy = () => {
    fetch(`${config.apiUrl}/reportes`)
      .then(res => res.json())
      .then(data => {
        const hoyStr = new Date().toLocaleDateString('sv-SE');
        const horaActual = new Date().getHours() * 60 + new Date().getMinutes();

        const asignadas = data.filter(r => {
          const fechaLocal = new Date(r.fecha_reporte).toLocaleDateString('sv-SE');
          return fechaLocal === hoyStr && r.id_estado_servicio === 4;
        });

        const porTecnico = {};
        asignadas.forEach(r => {
          if (!porTecnico[r.rut_usuario]) porTecnico[r.rut_usuario] = [];
          porTecnico[r.rut_usuario].push(r);
        });

        const ordenadas = Object.values(porTecnico).flatMap(grupo => {
          return grupo.sort((a, b) => {
            const aMin = parseInt(a.hora_inicio.slice(0, 2)) * 60 + parseInt(a.hora_inicio.slice(3, 5));
            const bMin = parseInt(b.hora_inicio.slice(0, 2)) * 60 + parseInt(b.hora_inicio.slice(3, 5));
            return Math.abs(aMin - horaActual) - Math.abs(bMin - horaActual);
          });
        });

        setTareasHoy(ordenadas);
      });
  };

  const obtenerReportes = () => {
    fetch(`${config.apiUrl}/reportes`)
      .then(res => res.json())
      .then(data => {
        const desde = new Date(filtro.desde);
        const hasta = new Date(filtro.hasta);

        const filtrados = data.filter(r => {
          const fecha = new Date(r.fecha_reporte);
          return (
            fecha >= desde &&
            fecha <= hasta &&
            r.id_estado_servicio !== 4
          );
        });

        const ordenados = filtrados.sort((a, b) => a.id_estado_servicio - b.id_estado_servicio);
        setReportes(ordenados);
      });
  };

  useEffect(() => {
    fetch(`${config.apiUrl}/usuarios`)
      .then(res => res.json())
      .then(data => setTecnicos(data.filter(u => u.id_tipo_usuario === 1)));

    fetch(`${config.apiUrl}/estados-servicio`)
      .then(res => res.json())
      .then(setEstados);

    obtenerTareasHoy();

    const hoy = new Date();
    const primerDia = new Date(hoy);
    primerDia.setDate(hoy.getDate() - hoy.getDay());
    const ultimoDia = new Date(primerDia);
    ultimoDia.setDate(primerDia.getDate() + 4);

    const desde = primerDia.toISOString().split('T')[0];
    const hasta = ultimoDia.toISOString().split('T')[0];

    setFiltro({ desde, hasta });

    setTimeout(() => obtenerReportes(), 300);
  }, []);

  const colores = {
    1: 'bg-yellow-200', // PENDIENTE
    2: 'bg-green-200',  // FINALIZADO
    3: 'bg-amber-600'   // CANCELADO (más café)
  };

  if (isAuthenticated === null) {
    return <div className="p-6">Verificando autenticación...</div>;
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Tareas Asignadas por fecha</h2>
      <div className="grid gap-2">
        {tareasHoy.map((t, i) => (
          <div key={i} className="border p-3 rounded shadow bg-white">
            <p><strong>Técnico:</strong> {tecnicos.find(tec => tec.rut === t.rut_usuario)?.nombre || t.rut_usuario}</p>
            <p><strong>Dirección:</strong> {t.direccion}</p>
            <p><strong>Hora:</strong> {t.hora_inicio} - {t.hora_fin}</p>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold my-6">Reportes Semana (o rango)</h2>
      <div className="mb-4">
        <p className="text-sm"><span className="inline-block w-4 h-4 bg-yellow-200 mr-2 rounded"></span> PENDIENTE</p>
        <p className="text-sm"><span className="inline-block w-4 h-4 bg-green-200 mr-2 rounded"></span> FINALIZADO</p>
        <p className="text-sm"><span className="inline-block w-4 h-4 bg-amber-400 mr-2 rounded"></span> CANCELADO</p>
      </div>

      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <div className="flex flex-col md:flex-row gap-2 w-full">
          <input type="date" value={filtro.desde} onChange={(e) => setFiltro({ ...filtro, desde: e.target.value })} className="border p-2 rounded w-full md:w-auto" />
          <input type="date" value={filtro.hasta} onChange={(e) => setFiltro({ ...filtro, hasta: e.target.value })} className="border p-2 rounded w-full md:w-auto" />
        </div>
        <button onClick={obtenerReportes} className="bg-blue-600 text-white px-4 py-2 rounded w-full md:w-auto">Filtrar</button>
      </div>

      <div className="grid gap-2">
        {reportes.map((r, i) => (
          <div key={i} className={`border p-3 rounded shadow ${colores[r.id_estado_servicio] || 'bg-gray-100'}`}>
            <p><strong>Técnico:</strong> {tecnicos.find(tec => tec.rut === r.rut_usuario)?.nombre || r.rut_usuario}</p>
            <p><strong>Dirección:</strong> {r.direccion}</p>
            <p><strong>Fecha:</strong> {r.fecha_reporte} {r.hora_inicio} - {r.hora_fin}</p>
            <p><strong>Estado:</strong> {estados.find(e => e.id_estado_servicio === r.id_estado_servicio)?.descripcion || r.id_estado_servicio}</p>
            <p><strong>Comentario:</strong> {r.comentario}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
