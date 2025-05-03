import { useState, useEffect } from 'react';
import config from '../config';

export default function Informes() {
  const [tecnicos, setTecnicos] = useState([]);
  const [tiposServicio, setTiposServicio] = useState([]);
  const [estados, setEstados] = useState([]);

  useEffect(() => {
    fetch(`${config.apiUrl}/usuarios`)
      .then(res => res.json())
      .then(data => setTecnicos(data.filter(u => u.id_tipo_usuario === 1)));

    fetch(`${config.apiUrl}/tipos-servicio`)
      .then(res => res.json())
      .then(setTiposServicio);

    fetch(`${config.apiUrl}/estados-servicio`)
      .then(res => res.json())
      .then(setEstados);
  }, []);

  // Reportes por Técnico
  const [filtroA, setFiltroA] = useState({ tecnico: '', desde: '', hasta: '' });
  const [reportesA, setReportesA] = useState([]);

  const obtenerA = () => {
    fetch(`${config.apiUrl}/reportes`)
      .then(res => res.json())
      .then(data => {
        const desde = new Date(filtroA.desde);
        const hasta = new Date(filtroA.hasta);
        const filtrados = data.filter(r => {
          const fecha = new Date(r.fecha_reporte);
          return fecha >= desde && fecha <= hasta && (!filtroA.tecnico || r.rut_usuario === filtroA.tecnico);
        });
        setReportesA(filtrados);
      });
  };

  const exportarCSV_A = () => {
    const encabezado = `Fecha,Comentario,Hora Inicio,Hora Fin,Dirección,Técnico\n`;
    const filas = reportesA.map(r => {
      const tecnico = tecnicos.find(t => t.rut === r.rut_usuario)?.nombre || r.rut_usuario;
      return `${r.fecha_reporte.slice(0, 10)},${r.comentario},${r.hora_inicio},${r.hora_fin},${r.direccion},${tecnico}`;
    }).join(`\n`);
    descargarArchivo(encabezado + filas, 'Informe_Tecnico.csv', 'text/csv');
  };

  // Reporte por Estado
  const [filtroB, setFiltroB] = useState({ estado: '', desde: '', hasta: '' });
  const [reportesB, setReportesB] = useState([]);

  const obtenerB = () => {
    fetch(`${config.apiUrl}/reportes`)
      .then(res => res.json())
      .then(data => {
        const desde = new Date(filtroB.desde);
        const hasta = new Date(filtroB.hasta);
        const filtrados = data.filter(r => {
          const fecha = new Date(r.fecha_reporte);
          return fecha >= desde && fecha <= hasta && (!filtroB.estado || r.id_estado_servicio === parseInt(filtroB.estado));
        });
        setReportesB(filtrados);
      });
  };

  // Carga por tecnico
  const [filtroC, setFiltroC] = useState({ desde: '', hasta: '' });
  const [datosC, setDatosC] = useState([]);

  const obtenerC = () => {
    fetch(`${config.apiUrl}/reportes`)
      .then(res => res.json())
      .then(data => {
        const desde = new Date(filtroC.desde);
        const hasta = new Date(filtroC.hasta);
        const filtrados = data.filter(r => {
          const fecha = new Date(r.fecha_reporte);
          return fecha >= desde && fecha <= hasta && r.id_tipo_servicio && r.hora_inicio && r.hora_fin;
        });

        const agrupado = {};
        filtrados.forEach(r => {
          const t = r.rut_usuario;
          const ts = r.id_tipo_servicio;
          const ti = new Date(`1970-01-01T${r.hora_inicio}`);
          const tf = new Date(`1970-01-01T${r.hora_fin}`);
          const duracion = (tf - ti) / 60000;

          if (!agrupado[t]) agrupado[t] = { total: 0, porServicio: {} };
          agrupado[t].total++;

          if (!agrupado[t].porServicio[ts]) agrupado[t].porServicio[ts] = { total: 0, acumulado: 0 };
          agrupado[t].porServicio[ts].total++;
          agrupado[t].porServicio[ts].acumulado += duracion;
        });

        const resultados = Object.entries(agrupado).map(([rut, data]) => {
          const tecnico = tecnicos.find(t => t.rut === rut)?.nombre || rut;
          const promedioDiario = (data.total / 20).toFixed(2);
          const porServicio = Object.entries(data.porServicio).map(([id, info]) => ({
            descripcion: tiposServicio.find(t => t.id_tipo_servicio == id)?.descripcion || `ID:${id}`,
            promedioMin: (info.acumulado / info.total).toFixed(1)
          }));
          return { tecnico, total: data.total, promedioDiario, porServicio };
        });

        setDatosC(resultados);
      });
  };

  // Totales por tipo de servicio
  const [filtroD, setFiltroD] = useState({ desde: '', hasta: '' });
  const [datosD, setDatosD] = useState([]);

  const obtenerD = () => {
    fetch(`${config.apiUrl}/reportes`)
      .then(res => res.json())
      .then(data => {
        const desde = new Date(filtroD.desde);
        const hasta = new Date(filtroD.hasta);
        const conteo = {};
        data.forEach(r => {
          const fecha = new Date(r.fecha_reporte);
          if (fecha >= desde && fecha <= hasta && r.id_tipo_servicio) {
            conteo[r.id_tipo_servicio] = (conteo[r.id_tipo_servicio] || 0) + 1;
          }
        });
        const resultados = Object.entries(conteo).map(([id, total]) => ({
          descripcion: tiposServicio.find(t => t.id_tipo_servicio == id)?.descripcion || `ID:${id}`,
          total
        }));
        setDatosD(resultados);
      });
  };

  
const exportarCSV_B = () => {
  const encabezado = `Fecha,Comentario,Hora Inicio,Hora Fin,Dirección,Estado\n`;
  const filas = reportesB.map(r => {
    const estado = estados.find(e => e.id_estado_servicio === r.id_estado_servicio)?.descripcion || r.id_estado_servicio;
    return `${r.fecha_reporte.slice(0, 10)},${r.comentario},${r.hora_inicio},${r.hora_fin},${r.direccion},${estado}`;
  }).join(`\n`);
  descargarArchivo(encabezado + filas, 'Informe_Estado.csv', 'text/csv');
};

const exportarCSV_C = () => {
  const encabezado = `Técnico,Total Reportes,Promedio Diario,Detalle por Tipo Servicio\n`;
  const filas = datosC.map(d =>
    `${d.tecnico},${d.total},${d.promedioDiario},"${
      d.porServicio.map(s => s.descripcion + ' (' + s.promedioMin + ' min)').join('; ')
    }"`
  ).join(`\n`);
  descargarArchivo(encabezado + filas, 'Informe_CargaTecnico.csv', 'text/csv');
};

const exportarCSV_D = () => {
  const encabezado = `Tipo de Servicio,Total\n`;
  const filas = datosD.map(d => `${d.descripcion},${d.total}`).join(`\n`);
  descargarArchivo(encabezado + filas, 'Informe_TipoServicio.csv', 'text/csv');
};

const limpiarA = () => { setFiltroA({ tecnico: '', desde: '', hasta: '' }); setReportesA([]); };
const limpiarB = () => { setFiltroB({ estado: '', desde: '', hasta: '' }); setReportesB([]); };
const limpiarC = () => { setFiltroC({ desde: '', hasta: '' }); setDatosC([]); };
const limpiarD = () => { setFiltroD({ desde: '', hasta: '' }); setDatosD([]); };

  const descargarArchivo = (contenido, nombre, tipo) => {
    const blob = new Blob(["\uFEFF" + contenido], { type: tipo + ';charset=utf-8;' });
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(blob);
    enlace.setAttribute('download', nombre);
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
  };

  return (
    <div className="p-6 bg-white">
      <h1 className="text-2xl font-bold mb-4">Informes</h1>
      
    
{/* Reportes por Técnico */}
<h2 className="text-xl font-bold my-4">Reporte por Técnico</h2>
<div className="flex flex-wrap gap-2 mb-2">
  <select value={filtroA.tecnico} onChange={e => setFiltroA({ ...filtroA, tecnico: e.target.value })} className="border p-2 rounded">
    <option value="">Todos los técnicos</option>
    {tecnicos.map(t => <option key={t.rut} value={t.rut}>{t.nombre}</option>)}
  </select>
  <input type="date" value={filtroA.desde} onChange={e => setFiltroA({ ...filtroA, desde: e.target.value })} className="border p-2 rounded" />
  <input type="date" value={filtroA.hasta} onChange={e => setFiltroA({ ...filtroA, hasta: e.target.value })} className="border p-2 rounded" />
  <button onClick={obtenerA} className="bg-blue-600 text-white px-4 py-2 rounded">Filtrar</button>
  <button onClick={limpiarA} className="bg-gray-600 text-white px-4 py-2 rounded">Limpiar</button>
  <button onClick={exportarCSV_A} className="bg-green-600 text-white px-4 py-2 rounded">Exportar Excel</button>
</div>
{reportesA.length > 0 && (
  <table className="min-w-full bg-white shadow mb-4">
    <thead><tr className="bg-gray-100"><th className="p-2">Fecha</th><th className="p-2">Comentario</th><th className="p-2">Inicio</th><th className="p-2">Fin</th><th className="p-2">Dirección</th><th className="p-2">Técnico</th></tr></thead>
    <tbody>{reportesA.map((r, i) => {
      const nombre = tecnicos.find(t => t.rut === r.rut_usuario)?.nombre || r.rut_usuario;
      return <tr key={i}><td className="p-2">{r.fecha_reporte.slice(0,10)}</td><td className="p-2">{r.comentario}</td><td className="p-2">{r.hora_inicio}</td><td className="p-2">{r.hora_fin}</td><td className="p-2">{r.direccion}</td><td className="p-2">{nombre}</td></tr>;
    })}</tbody>
  </table>
)}

{/* Reporte por Estado */}
<h2 className="text-xl font-bold my-4">Reporte por estado</h2>
<div className="flex flex-wrap gap-2 mb-2">
  <select value={filtroB.estado} onChange={e => setFiltroB({ ...filtroB, estado: e.target.value })} className="border p-2 rounded">
    <option value="">Todos los estados</option>
    {estados.map(e => <option key={e.id_estado_servicio} value={e.id_estado_servicio}>{e.descripcion}</option>)}
  </select>
  <input type="date" value={filtroB.desde} onChange={e => setFiltroB({ ...filtroB, desde: e.target.value })} className="border p-2 rounded" />
  <input type="date" value={filtroB.hasta} onChange={e => setFiltroB({ ...filtroB, hasta: e.target.value })} className="border p-2 rounded" />
  <button onClick={obtenerB} className="bg-blue-600 text-white px-4 py-2 rounded">Filtrar</button>
  <button onClick={limpiarB} className="bg-gray-600 text-white px-4 py-2 rounded">Limpiar</button>
  <button onClick={exportarCSV_B} className="bg-green-600 text-white px-4 py-2 rounded">Exportar Excel</button>
</div>
{reportesB.length > 0 && (
  <table className="min-w-full bg-white shadow mb-4">
    <thead><tr className="bg-gray-100"><th className="p-2">Fecha</th><th className="p-2">Comentario</th><th className="p-2">Inicio</th><th className="p-2">Fin</th><th className="p-2">Dirección</th><th className="p-2">Estado</th></tr></thead>
    <tbody>{reportesB.map((r, i) => {
      const estado = estados.find(e => e.id_estado_servicio === r.id_estado_servicio)?.descripcion || r.id_estado_servicio;
      return <tr key={i}><td className="p-2">{r.fecha_reporte.slice(0,10)}</td><td className="p-2">{r.comentario}</td><td className="p-2">{r.hora_inicio}</td><td className="p-2">{r.hora_fin}</td><td className="p-2">{r.direccion}</td><td className="p-2">{estado}</td></tr>;
    })}</tbody>
  </table>
)}

{/* Carga por técnico */}
<h2 className="text-xl font-bold my-4">Carga por técnico</h2>
<div className="flex flex-wrap gap-2 mb-2">
  <input type="date" value={filtroC.desde} onChange={e => setFiltroC({ ...filtroC, desde: e.target.value })} className="border p-2 rounded" />
  <input type="date" value={filtroC.hasta} onChange={e => setFiltroC({ ...filtroC, hasta: e.target.value })} className="border p-2 rounded" />
  <button onClick={obtenerC} className="bg-blue-600 text-white px-4 py-2 rounded">Filtrar</button>
  <button onClick={limpiarC} className="bg-gray-600 text-white px-4 py-2 rounded">Limpiar</button>
  <button onClick={exportarCSV_C} className="bg-green-600 text-white px-4 py-2 rounded">Exportar Excel</button>
</div>
{datosC.length > 0 && (
  <table className="min-w-full bg-white shadow mb-4">
    <thead><tr className="bg-gray-100"><th className="p-2">Técnico</th><th className="p-2">Total</th><th className="p-2">Prom. Diario</th><th className="p-2">Servicios</th></tr></thead>
    <tbody>{datosC.map((d, i) => (
      <tr key={i}><td className="p-2">{d.tecnico}</td><td className="p-2">{d.total}</td><td className="p-2">{d.promedioDiario}</td><td className="p-2">
        {d.porServicio.map((s, j) => (
          <div key={j}>{s.descripcion} ({s.promedioMin} min)</div>
        ))}
      </td></tr>
    ))}</tbody>
  </table>
)}

{/* Totales por tipo de servicio */}
<h2 className="text-xl font-bold my-4">Totales por tipo de servicio</h2>
<div className="flex flex-wrap gap-2 mb-2">
  <input type="date" value={filtroD.desde} onChange={e => setFiltroD({ ...filtroD, desde: e.target.value })} className="border p-2 rounded" />
  <input type="date" value={filtroD.hasta} onChange={e => setFiltroD({ ...filtroD, hasta: e.target.value })} className="border p-2 rounded" />
  <button onClick={obtenerD} className="bg-blue-600 text-white px-4 py-2 rounded">Filtrar</button>
  <button onClick={limpiarD} className="bg-gray-600 text-white px-4 py-2 rounded">Limpiar</button>
  <button onClick={exportarCSV_D} className="bg-green-600 text-white px-4 py-2 rounded">Exportar Excel</button>
</div>
{datosD.length > 0 && (
  <table className="min-w-full bg-white shadow mb-4">
    <thead><tr className="bg-gray-100"><th className="p-2">Tipo de Servicio</th><th className="p-2">Total</th></tr></thead>
    <tbody>{datosD.map((d, i) => (
      <tr key={i}><td className="p-2">{d.descripcion}</td><td className="p-2">{d.total}</td></tr>
    ))}</tbody>
  </table>
)}

    </div>
  );
}
