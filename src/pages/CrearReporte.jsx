import { useEffect, useState } from 'react';
import config from '../config';
import useAuth from '../hooks/useAuth';

export default function CrearReporte() {
  const isAuthenticated = useAuth();
  const rut = localStorage.getItem('usuarioRut');
  const [clientes, setClientes] = useState([]);
  const [tiposServicio, setTiposServicio] = useState([]);
  const [tiposHardware, setTiposHardware] = useState([]);
  const [sistemasOperativo, setSistemasOperativo] = useState([]);
  const [estadosServicio, setEstadosServicio] = useState([]);
  const [form, setForm] = useState({
    fecha: '',
    cliente: '',
    horaInicio: '',
    horaFin: '',
    direccion: '',
    comentario: '',
    tipoServicio: '',
    tipoHardware: '',
    sistemaOperativo: '',
    estadoServicio: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const hoy = new Date().toISOString().split('T')[0];
  const haceUnMes = new Date();
  haceUnMes.setMonth(haceUnMes.getMonth() - 1);
  const minimoFecha = haceUnMes.toISOString().split('T')[0];

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
      setEstadosServicio(data.filter(e => e.descripcion !== 'ASIGNADO'));
    });
  }, []);

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
    if (fecha < minimoFecha || fecha > hoy) {
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

    try {
      const res = await fetch(`${config.apiUrl}/reportes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccessMessage('Reporte creado exitosamente.');
        setForm({ fecha: '', cliente: '', horaInicio: '', horaFin: '', direccion: '', comentario: '', tipoServicio: '', tipoHardware: '', sistemaOperativo: '', estadoServicio: '' });
      } else {
        setError('Error al crear el reporte.');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión.');
    }
  };

  if (isAuthenticated === null) {
    return <div className="p-6">Verificando autenticación...</div>;
  }
  if (!isAuthenticated) {
    return <div className="p-6 text-red-600 font-bold">Acceso no autorizado</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Crear reporte</h1>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <input type="date" name="fecha" value={form.fecha} min={minimoFecha} max={hoy} onChange={handleChange} className="border p-2 rounded" required />

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

        <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded">Crear reporte</button>

        {successMessage && <p className="text-green-600 font-semibold">{successMessage}</p>}
        {error && <p className="text-red-600 font-semibold">{error}</p>}
      </form>
    </div>
  );
}