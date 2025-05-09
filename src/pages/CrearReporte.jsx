import { useEffect, useState } from 'react';
import config from '../config';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function CrearReporte() {
  const isAuthenticated = useAuth();
  const navigate = useNavigate();
  const rut = localStorage.getItem('usuarioRut');
  const [clientes, setClientes] = useState([]);
  const [tiposServicio, setTiposServicio] = useState([]);
  const [tiposHardware, setTiposHardware] = useState([]);
  const [sistemasOperativo, setSistemasOperativo] = useState([]);
  const [estadosServicio, setEstadosServicio] = useState([]);
  const [reportesRecientes, setReportesRecientes] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idReporteEditando, setIdReporteEditando] = useState(null);
  const [form, setForm] = useState({
    fecha: '', cliente: '', horaInicio: '', horaFin: '',
    direccion: '', comentario: '', tipoServicio: '', tipoHardware: '',
    sistemaOperativo: '', estadoServicio: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated === false) navigate('/');
  }, [isAuthenticated]);

  const hoy = new Date().toISOString().split('T')[0];
  const hace15Dias = new Date();
  hace15Dias.setDate(hace15Dias.getDate() - 14);
  const minimoFecha = new Date();
  minimoFecha.setMonth(minimoFecha.getMonth() - 1);
  const minFechaReporte = minimoFecha.toISOString().split('T')[0];

  const generarHoras = (inicio, fin, step) => {
    const horas = [];
    let h = inicio.split(':').map(Number);
    let m = h[0] * 60 + h[1];
    const end = parseInt(fin.split(':')[0]) * 60 + parseInt(fin.split(':')[1]);
    while (m <= end) {
      const hh = String(Math.floor(m / 60)).padStart(2, '0');
      const mm = String(m % 60).padStart(2, '0');
      horas.push(`${hh}:${mm}`);
      m += step;
    }
    return horas;
  };

  const horasInicio = generarHoras('06:00', '23:45', 15);
  const horasFin = generarHoras('06:15', '23:59', 15);

  useEffect(() => {
    fetch(`${config.apiUrl}/clientes`).then(res => res.json()).then(setClientes);
    fetch(`${config.apiUrl}/tipos-servicio`).then(res => res.json()).then(setTiposServicio);
    fetch(`${config.apiUrl}/tipos-hardware`).then(res => res.json()).then(setTiposHardware);
    fetch(`${config.apiUrl}/sistemas-operativo`).then(res => res.json()).then(setSistemasOperativo);
    fetch(`${config.apiUrl}/estados-servicio`).then(res => res.json()).then(data => {
      setEstadosServicio(data.filter(e => !['ASIGNADO', 'ELIMINADO'].includes(e.descripcion)));
    });
    cargarReportes();
  }, []);

  const cargarReportes = async () => {
    const res = await fetch(`${config.apiUrl}/reportes`);
    const data = await res.json();
    const ahora = new Date();
    const filtrados = data.filter(r => {
      const fecha = new Date(r.fecha_reporte);
      return r.rut_usuario === rut && fecha >= hace15Dias && fecha <= ahora && r.id_estado_servicio !== 5;
    });
    filtrados.sort((a, b) => {
      if (a.id_estado_servicio === 4 && b.id_estado_servicio !== 4) return -1;
      if (a.id_estado_servicio !== 4 && b.id_estado_servicio === 4) return 1;
      return new Date(b.fecha_reporte) - new Date(a.fecha_reporte);
    });
    setReportesRecientes(filtrados);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'horaFin' && !form.horaInicio) {
      const [h, m] = value.split(':').map(Number);
      const minutos = h * 60 + m - 15;
      const hh = String(Math.floor(minutos / 60)).padStart(2, '0');
      const mm = String(minutos % 60).padStart(2, '0');
      setForm(prev => ({ ...prev, horaInicio: `${hh}:${mm}` }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const { fecha, cliente, horaInicio, horaFin, direccion, comentario, tipoServicio, tipoHardware, sistemaOperativo, estadoServicio } = form;
    if (!fecha || !cliente || !horaInicio || !horaFin || !direccion || !comentario || !tipoServicio || !tipoHardware || !sistemaOperativo || !estadoServicio) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    if (fecha < minFechaReporte || fecha > hoy) {
      setError('La fecha debe estar dentro del mes actual.');
      return;
    }
    if (direccion.length < 5 || comentario.length < 5 || direccion.length > 250 || comentario.length > 250) {
      setError('Dirección y comentario deben tener entre 5 y 250 caracteres.');
      return;
    }
    if (horaFin <= horaInicio) {
      setError('La hora de fin debe ser posterior a la hora de inicio.');
      return;
    }

    const payload = {
      fecha_reporte: fecha,
      timestamp: new Date().toISOString(),
      comentario,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      direccion,
      rut_usuario: rut,
      id_cliente: parseInt(cliente),
      id_tipo_servicio: parseInt(tipoServicio),
      id_tipo_hardware: parseInt(tipoHardware),
      id_sistema_operativo: parseInt(sistemaOperativo),
      id_estado_servicio: parseInt(estadoServicio)
    };

    const url = `${config.apiUrl}/reportes${modoEdicion ? '/' + idReporteEditando : ''}`;
    const method = modoEdicion ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      setSuccessMessage(modoEdicion ? 'Reporte actualizado correctamente.' : 'Reporte creado exitosamente.');
      setModoEdicion(false);
      setIdReporteEditando(null);
      setForm({ fecha: '', cliente: '', horaInicio: '', horaFin: '', direccion: '', comentario: '', tipoServicio: '', tipoHardware: '', sistemaOperativo: '', estadoServicio: '' });
      cargarReportes();
    } else {
      setError('Error al guardar el reporte.');
    }
  };

  const handleEditar = (reporte) => {
    setModoEdicion(true);
    setIdReporteEditando(reporte.id_reporte);
    setForm({
      fecha: reporte.fecha_reporte,
      cliente: reporte.id_cliente,
      horaInicio: reporte.hora_inicio,
      horaFin: reporte.hora_fin,
      direccion: reporte.direccion,
      comentario: reporte.comentario,
      tipoServicio: reporte.id_tipo_servicio,
      tipoHardware: reporte.id_tipo_hardware,
      sistemaOperativo: reporte.id_sistema_operativo,
      estadoServicio: reporte.id_estado_servicio
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este reporte?')) return;

    const res = await fetch(`${config.apiUrl}/reportes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_estado_servicio: 5,
        comentario: 'Supervisor - Auditar'
      })
    });

    if (res.ok) {
      setSuccessMessage('Reporte eliminado correctamente.');
      cargarReportes();
    } else {
      setError('No se pudo eliminar el reporte.');
    }
  };

  if (isAuthenticated === null) return <div className="p-6">Verificando autenticación...</div>;


  return (
    <div className="bg-white p-6  mx-auto  rounded shadow">
      <h1 className="text-2xl font-bold mb-4">{modoEdicion ? 'Editar reporte' : 'Crear reporte'}</h1>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <input type="date" name="fecha" value={form.fecha} min={minFechaReporte} max={hoy} onChange={handleChange} className="border p-2 rounded" required />
        <select name="cliente" value={form.cliente} onChange={handleChange} className="border p-2 rounded" required>
          <option value="">Selecciona cliente</option>
          {clientes.map(c => <option key={c.id_cliente} value={c.id_cliente}>{c.nombre_cliente}</option>)}
        </select>
        <select name="horaInicio" value={form.horaInicio} onChange={handleChange} className="border p-2 rounded" required>
          <option value="">Hora de inicio</option>
          {horasInicio.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
        <select name="horaFin" value={form.horaFin} onChange={handleChange} className="border p-2 rounded" required>
          <option value="">Hora de fin</option>
          {horasFin.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
        <input type="text" name="direccion" value={form.direccion} onChange={handleChange} placeholder="Dirección" className="border p-2 rounded" maxLength={250} required />
        <textarea name="comentario" value={form.comentario} onChange={handleChange} placeholder="Comentario" className="border p-2 rounded" maxLength={250} required />
        <select name="tipoServicio" value={form.tipoServicio} onChange={handleChange} className="border p-2 rounded" required>
          <option value="">Tipo de servicio</option>
          {tiposServicio.map(t => <option key={t.id_tipo_servicio} value={t.id_tipo_servicio}>{t.descripcion}</option>)}
        </select>
        <select name="tipoHardware" value={form.tipoHardware} onChange={handleChange} className="border p-2 rounded" required>
          <option value="">Tipo de hardware</option>
          {tiposHardware.map(t => <option key={t.id_tipo_hardware} value={t.id_tipo_hardware}>{t.descripcion}</option>)}
        </select>
        <select name="sistemaOperativo" value={form.sistemaOperativo} onChange={handleChange} className="border p-2 rounded" required>
          <option value="">Sistema operativo</option>
          {sistemasOperativo.map(s => <option key={s.id_sistema_operativo} value={s.id_sistema_operativo}>{s.nombre_sistema}</option>)}
        </select>
        <select name="estadoServicio" value={form.estadoServicio} onChange={handleChange} className="border p-2 rounded" required>
          <option value="">Estado del servicio</option>
          {estadosServicio.map(e => <option key={e.id_estado_servicio} value={e.id_estado_servicio}>{e.descripcion}</option>)}
        </select>
        <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded">
          {modoEdicion ? 'Guardar cambios' : 'Crear reporte'}
        </button>
        {successMessage && <p className="text-green-600 font-semibold">{successMessage}</p>}
        {error && <p className="text-red-600 font-semibold">{error}</p>}
      </form>

      {/* Leyenda de colores */}
      <h2 className="text-xl font-bold mt-10 mb-2">Visualización de estados:</h2>
      <ul className="flex flex-wrap gap-4 mb-6">
        <li className="flex items-center gap-2"><span className="w-4 h-4 bg-yellow-300 inline-block rounded-sm"></span>ASIGNADO</li>
        <li className="flex items-center gap-2"><span className="w-4 h-4 bg-green-400 inline-block rounded-sm"></span>FINALIZADO</li>
        <li className="flex items-center gap-2"><span className="w-4 h-4 bg-amber-700 inline-block rounded-sm"></span>CANCELADO</li>
        <li className="flex items-center gap-2"><span className="w-4 h-4 bg-sky-300 inline-block rounded-sm"></span>PENDIENTE</li>
      </ul>

      <h2 className="text-xl font-bold mt-10 mb-4">Tus reportes recientes</h2>
      {reportesRecientes.length === 0 ? <p>No hay reportes recientes.</p> : (
        <ul className="space-y-4">
          {reportesRecientes.map(r => {
            const colorClase =
              r.id_estado_servicio === 4 ? 'bg-yellow-100' :
              r.id_estado_servicio === 2 ? 'bg-green-100' :
              r.id_estado_servicio === 3 ? 'bg-amber-100' :
              r.id_estado_servicio === 1 ? 'bg-sky-100' : 'bg-white';

            const textoEstado =
              r.id_estado_servicio === 4 ? 'ASIGNADO' :
              r.id_estado_servicio === 2 ? 'FINALIZADO' :
              r.id_estado_servicio === 3 ? 'CANCELADO' :
              r.id_estado_servicio === 1 ? 'PENDIENTE' : 'OTRO';

            return (
              <li key={r.id_reporte} className={`border p-4 rounded shadow flex flex-col md:flex-row justify-between items-start md:items-center ${colorClase}`}>
                <div>
                  <p className="font-semibold">{r.fecha_reporte} - {r.direccion}</p>
                  <p className="text-sm">{r.comentario}</p>
                  <p className="text-xs mt-1 font-medium">Estado: {textoEstado}</p>
                </div>
                <div className="mt-2 md:mt-0 space-x-2">
                  <button onClick={() => handleEditar(r)} className="bg-blue-600 text-white px-3 py-1 rounded">Editar</button>
                  <button onClick={() => handleEliminar(r.id_reporte)} className="bg-red-600 text-white px-3 py-1 rounded">Eliminar</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
