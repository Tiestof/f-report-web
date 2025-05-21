import { useState, useEffect } from 'react';
import config from '../config';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function GestionUsuarios() {
  const isAuthenticated = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated === false) navigate('/');
  }, [isAuthenticated]);

  const [usuarios, setUsuarios] = useState([]);
  const [tiposUsuario, setTiposUsuario] = useState([]);
  const [form, setForm] = useState({
    rut: '',
    nombre: '',
    email: '',
    edad: '',
    clave: '',
    id_tipo_usuario: ''
  });
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState('');
  const [editando, setEditando] = useState(false);
  const [mensajeTabla, setMensajeTabla] = useState('');
  const [tablaSeleccionada, setTablaSeleccionada] = useState('');
  const [datosTabla, setDatosTabla] = useState([]);
  const [descripcion, setDescripcion] = useState('');
  const [editandoTabla, setEditandoTabla] = useState(false);
  const [idEditar, setIdEditar] = useState(null);

  useEffect(() => {
    cargarUsuarios();
    cargarTiposUsuario();
  }, []);

  const cargarUsuarios = () => {
    fetch(`${config.apiUrl}/usuarios`)
      .then(res => res.json())
      .then(data => setUsuarios(data));
  };

  const cargarTiposUsuario = () => {
    fetch(`${config.apiUrl}/tipos-usuario`)
      .then(res => res.json())
      .then(data => setTiposUsuario(data));
  };

  const validarRutCompleto = (rut) => {
    let suma = 0, multiplo = 2;
    for (let i = rut.length - 1; i >= 0; i--) {
      suma += parseInt(rut[i]) * multiplo;
      multiplo = multiplo === 7 ? 2 : multiplo + 1;
    }
    const dvEsperado = 11 - (suma % 11);
    return dvEsperado !== 10;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!form.rut || !/^\d+$/.test(form.rut)) {
      nuevosErrores.rut = 'RUT debe ser solo números';
    } else if (!validarRutCompleto(form.rut)) {
      nuevosErrores.rut = 'RUT inválido (módulo 11 incorrecto)';
    }

    if (!form.nombre) {
      nuevosErrores.nombre = 'Nombre es obligatorio';
    }

    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) {
      nuevosErrores.email = 'Email inválido';
    }

    if (!form.edad || form.edad < 16 || form.edad > 100) {
      nuevosErrores.edad = 'Edad debe estar entre 16 y 100';
    }

    if (!form.clave || form.clave.length < 4 || form.clave.length > 8) {
      nuevosErrores.clave = 'Clave debe tener entre 4 y 8 caracteres';
    }

    if (!form.id_tipo_usuario) {
      nuevosErrores.id_tipo_usuario = 'Debe seleccionar un tipo de usuario';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const guardarUsuario = () => {
    if (!validarFormulario()) return;

    const metodo = editando ? 'PUT' : 'POST';
    const url = editando ? `${config.apiUrl}/usuarios/${form.rut}` : `${config.apiUrl}/usuarios`;

    fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    .then(async res => {
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error en la solicitud');
      }
      return res.json();
    })
    .then(() => {
      setMensaje(editando ? 'Usuario actualizado' : 'Usuario creado');
      setForm({ rut: '', nombre: '', email: '', edad: '', clave: '', id_tipo_usuario: '' });
      setEditando(false);
      cargarUsuarios();
    })
    .catch(err => {
      setMensaje(`Error: ${err.message}`);
    });
  };

  const editarUsuario = (usuario) => {
    setForm(usuario);
    setEditando(true);
    setMensaje('');
  };

  const eliminarUsuario = (rut) => {
    fetch(`${config.apiUrl}/usuarios/${rut}`, { method: 'DELETE' })
      .then(() => {
        setMensaje('Usuario eliminado');
        cargarUsuarios();
      });
  };

  const cargarTabla = (tabla) => {
    fetch(`${config.apiUrl}/${tabla}`)
      .then(res => res.json())
      .then(data => setDatosTabla(data));
  };

  const editarItemTabla = (item) => {
    const desc = item.descripcion || item.descripcion_usuario || item.nombre_cliente || item.nombre_sistema;
    setDescripcion(desc);
    setIdEditar(item.id_cliente || item.id_estado_servicio || item.id_tipo_usuario || item.id_sistema_operativo || item.id_tipo_hardware || item.id_tipo_servicio);
    setEditandoTabla(true);
  };

  const guardarItemTabla = () => {
    if (!descripcion || !tablaSeleccionada) return;

    const metodo = editandoTabla ? 'PUT' : 'POST';
    const url = editandoTabla
      ? `${config.apiUrl}/${tablaSeleccionada}/${idEditar}`
      : `${config.apiUrl}/${tablaSeleccionada}`;

    let campo = 'descripcion';
    if (tablaSeleccionada === 'tipos-usuario') campo = 'descripcion_usuario';
    if (tablaSeleccionada === 'clientes') campo = 'nombre_cliente';
    if (tablaSeleccionada === 'sistemas-operativo') campo = 'nombre_sistema';

    const cuerpo = {};
    cuerpo[campo] = descripcion;

    fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo)
    })
      .then(res => res.json())
      .then(() => {
        cargarTabla(tablaSeleccionada);
        setDescripcion('');
        setEditandoTabla(false);
        setIdEditar(null);
        setMensajeTabla(editandoTabla ? 'Elemento actualizado correctamente' : 'Elemento creado correctamente');
        setTimeout(() => setMensajeTabla(''), 3000);
      });
  };

  if (isAuthenticated === null) {
    return <div className="p-6">Verificando autenticación...</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-700 mb-6">Gestión de Usuarios</h1>

      {/* Listamos los Usuarios */}
      <div className="mb-8 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">Lista de Usuarios</h2>
        <table className="min-w-[640px] bg-white w-full">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">RUT</th>
              <th className="py-2 px-4 border-b">Nombre</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Nivel</th>
              <th className="py-2 px-4 border-b">Tipo</th>
              <th className="py-2 px-4 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u, idx) => (
              <tr key={idx}>
                <td className="py-2 px-4 border-b">{u.rut}</td>
                <td className="py-2 px-4 border-b">{u.nombre}</td>
                <td className="py-2 px-4 border-b">{u.email}</td>
                <td className="py-2 px-4 border-b">{u.edad}</td>
                <td className="py-2 px-4 border-b">
                  {tiposUsuario.find(t => t.id_tipo_usuario === u.id_tipo_usuario)?.descripcion_usuario || '—'}
                </td>
                <td className="py-2 px-4 border-b">
                  <button onClick={() => editarUsuario(u)} className="bg-blue-500 text-white px-2 py-1 rounded mr-2">Editar</button>
                  <button onClick={() => eliminarUsuario(u.rut)} className="bg-red-500 text-white px-2 py-1 rounded">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Formulario */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">{editando ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
        {mensaje && <p className="text-green-600 mb-2">{mensaje}</p>}
        <input type="text" name="rut" placeholder="RUT" value={form.rut} onChange={handleInputChange} className="mb-1 p-2 border w-full" disabled={editando}/>
        {errores.rut && <p className="text-red-500 mb-2">{errores.rut}</p>}
        <input type="text" name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleInputChange} className="mb-1 p-2 border w-full" />
        {errores.nombre && <p className="text-red-500 mb-2">{errores.nombre}</p>}
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleInputChange} className="mb-1 p-2 border w-full" />
        {errores.email && <p className="text-red-500 mb-2">{errores.email}</p>}
        <input type="number" name="edad" placeholder="Nivel" value={form.edad} onChange={handleInputChange} className="mb-1 p-2 border w-full" />
        {errores.edad && <p className="text-red-500 mb-2">{errores.edad}</p>}
        <input type="password" name="clave" placeholder="Clave" value={form.clave} onChange={handleInputChange} className="mb-1 p-2 border w-full" />
        {errores.clave && <p className="text-red-500 mb-2">{errores.clave}</p>}
        <select name="id_tipo_usuario" value={form.id_tipo_usuario} onChange={handleInputChange} className="mb-1 p-2 border w-full">
          <option value="">Selecciona Tipo Usuario</option>
          {tiposUsuario.map((tipo, idx) => (
            <option key={idx} value={tipo.id_tipo_usuario}>{tipo.descripcion_usuario}</option>
          ))}
        </select>
        {errores.id_tipo_usuario && <p className="text-red-500 mb-2">{errores.id_tipo_usuario}</p>}
        <button onClick={guardarUsuario} className="bg-green-500 text-white px-4 py-2 rounded mt-2">{editando ? 'Guardar Cambios' : 'Crear Usuario'}</button>
      </div>

      {/* GESTIÓN DE TABLAS */}
      <div className="bg-white p-6 rounded shadow mt-10">
        <h2 className="text-xl font-semibold mb-4">Gestión de Tablas</h2>

        <select value={tablaSeleccionada} onChange={(e) => {
          setTablaSeleccionada(e.target.value);
          cargarTabla(e.target.value);
          setDescripcion('');
          setEditandoTabla(false);
        }} className="mb-4 p-2 border w-full">
          <option value="">Selecciona una tabla</option>
          <option value="clientes">Cliente</option>
          <option value="estados-servicio">EstadoServicio</option>
          <option value="tipos-usuario">TipoUsuario</option>
          <option value="sistemas-operativo">SistemaOperativo</option>
          <option value="tipos-hardware">TipoHardware</option>
          <option value="tipos-servicio">TipoServicio</option>
        </select>

        {datosTabla.length > 0 && (
          <table className="min-w-full bg-white mb-4">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Descripción</th>
                <th className="py-2 px-4 border-b">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {datosTabla.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2 px-4 border-b">{item.descripcion || item.descripcion_usuario || item.nombre_cliente || item.nombre_sistema}</td>
                  <td className="py-2 px-4 border-b">
                    <button onClick={() => editarItemTabla(item)} className="bg-blue-500 text-white px-2 py-1 rounded">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <input type="text" placeholder="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="mb-2 p-2 border w-full" />
        <button onClick={guardarItemTabla} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
             {editandoTabla ? 'Guardar Cambios' : 'Agregar Nuevo'}
        </button>

            {mensajeTabla && <p className="text-green-600 mt-2">{mensajeTabla}</p>}
      </div>
    </div>
  );
}
