import { useEffect, useState } from 'react';
import config from '../config';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function CrearTarea() {
  const isAuthenticated = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated === false) navigate('/');
  }, [isAuthenticated]);

  const [usuarios, setUsuarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({
    rut_usuario: '',
    fecha_reporte: '',
    hora_inicio: '',
    id_cliente: '',
    direccion: ''
  });
  const [mensaje, setMensaje] = useState('');
  const [tareasAsignadas, setTareasAsignadas] = useState([]);

  useEffect(() => {
    fetch(`${config.apiUrl}/usuarios`)
      .then(res => res.json())
      .then(data => {
        const tecnicos = data.filter(u => u.id_tipo_usuario === 1);
        setUsuarios(tecnicos);
      });

    fetch(`${config.apiUrl}/clientes`)
      .then(res => res.json())
      .then(data => setClientes(data));

    cargarTareasAsignadas();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const cargarTareasAsignadas = () => {
    fetch(`${config.apiUrl}/reportes`)
      .then(res => res.json())
      .then(data => {
        const asignadas = data.filter(r => r.id_estado_servicio === 4 && new Date(r.fecha_reporte).getMonth() === new Date().getMonth());
        setTareasAsignadas(asignadas);
      });
  };

  const generarHoras = () => {
    const horas = [];
    for (let h = 6; h <= 23; h++) {
      for (let m of [0, 15, 30, 45]) {
        const hh = h.toString().padStart(2, '0');
        const mm = m.toString().padStart(2, '0');
        horas.push(`${hh}:${mm}:00`);
      }
    }
    return horas;
  };

  const guardar = () => {
    if (!form.rut_usuario || !form.fecha_reporte || !form.hora_inicio || !form.id_cliente || !form.direccion) {
      setMensaje('Todos los campos son obligatorios');
      setTimeout(() => setMensaje(''), 3000);
      return;
    }

    const body = {
      rut_usuario: form.rut_usuario,
      fecha_reporte: form.fecha_reporte,
      hora_inicio: form.hora_inicio,
      direccion: form.direccion,
      id_cliente: parseInt(form.id_cliente),
      id_estado_servicio: 4,
      comentario: null,
      hora_fin: null,
      id_tipo_servicio: null,
      id_tipo_hardware: null,
      id_sistema_operativo: null
    };

    fetch(`${config.apiUrl}/reportes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(res => res.json())
      .then(() => {
        setMensaje('Tarea creada correctamente');
        setForm({
          rut_usuario: '',
          fecha_reporte: '',
          hora_inicio: '',
          id_cliente: '',
          direccion: ''
        });
        cargarTareasAsignadas();
        setTimeout(() => setMensaje(''), 3000);
      });
  };

  if (isAuthenticated === null) {
    return <div className="p-6">Verificando autenticación...</div>;
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Crear Tarea</h2>

      {mensaje && <p className="text-green-600 mb-4">{mensaje}</p>}

      <select name="rut_usuario" value={form.rut_usuario} onChange={handleChange} className="mb-2 p-2 border w-full">
        <option value="">Selecciona Técnico</option>
        {usuarios.map((u, idx) => (
          <option key={idx} value={u.rut}>{u.nombre}</option>
        ))}
      </select>

      <input type="date" name="fecha_reporte" value={form.fecha_reporte} onChange={handleChange} className="mb-2 p-2 border w-full" />

      <select name="hora_inicio" value={form.hora_inicio} onChange={handleChange} className="mb-2 p-2 border w-full">
        <option value="">Selecciona Hora de Inicio</option>
        {generarHoras().map((h, i) => (
          <option key={i} value={h}>{h}</option>
        ))}
      </select>

      <select name="id_cliente" value={form.id_cliente} onChange={handleChange} className="mb-2 p-2 border w-full">
        <option value="">Selecciona Cliente</option>
        {clientes.map((c, idx) => (
          <option key={idx} value={c.id_cliente}>{c.nombre_cliente}</option>
        ))}
      </select>

      <input type="text" name="direccion" placeholder="Dirección" maxLength="250" value={form.direccion} onChange={handleChange} className="mb-2 p-2 border w-full" />

      <button onClick={guardar} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Guardar</button>

      {tareasAsignadas.length > 0 && (
        <div className="mt-10">
          <h3 className="text-xl font-bold mb-4">Tareas Asignadas del Mes</h3>
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Técnico</th>
                <th className="py-2 px-4 border-b">Fecha</th>
                <th className="py-2 px-4 border-b">Hora Inicio</th>
                <th className="py-2 px-4 border-b">Cliente</th>
                <th className="py-2 px-4 border-b">Dirección</th>
              </tr>
            </thead>
            <tbody>
              {tareasAsignadas.map((t, idx) => (
                <tr key={idx}>
                  <td className="py-2 px-4 border-b">{t.rut_usuario}</td>
                  <td className="py-2 px-4 border-b">{t.fecha_reporte}</td>
                  <td className="py-2 px-4 border-b">{t.hora_inicio}</td>
                  <td className="py-2 px-4 border-b">{clientes.find(c => c.id_cliente === t.id_cliente)?.nombre_cliente || '—'}</td>
                  <td className="py-2 px-4 border-b">{t.direccion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
