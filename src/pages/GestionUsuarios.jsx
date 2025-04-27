import { useState, useEffect } from 'react';
import config from '../config';

export default function GestionUsuarios() {
  const [mensaje, setMensaje] = useState('');
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
  const [editando, setEditando] = useState(false);

  // Cargar usuarios y tipos de usuario
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
      nuevosErrores.rut = 'RUT inválido';
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
    console.log('Intentando guardar usuario...', form);
    if (!validarFormulario()) return;
    
    const metodo = editando ? 'PUT' : 'POST';
    const url = editando ? `${config.apiUrl}/usuarios/${form.rut}` : `${config.apiUrl}/usuarios`;
  
    fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(data => {
        console.log('Respuesta API:', data); 
        setMensaje(editando ? 'Usuario actualizado' : 'Usuario creado');
        setForm({ rut: '', nombre: '', email: '', edad: '', clave: '', id_tipo_usuario: '' });
        setEditando(false);
        cargarUsuarios();
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

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-700 mb-6">Gestión de Usuarios</h1>

      {/* Lista de Usuarios */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Lista de Usuarios</h2>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">RUT</th>
              <th className="py-2 px-4 border-b">Nombre</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Edad</th>
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
                <td className="py-2 px-4 border-b">{u.descripcion_usuario}</td>
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

  {/* Mostrar éxito si existe */}
  {mensaje && <p className="text-green-600 mb-2">{mensaje}</p>}

  {/* RUT */}
  <input
    type="text"
    name="rut"
    placeholder="RUT (solo números)"
    value={form.rut}
    onChange={handleInputChange}
    className="mb-1 p-2 border w-full"
  />
  {errores.rut && <p className="text-red-500 mb-2">{errores.rut}</p>}

  {/* Nombre */}
  <input
    type="text"
    name="nombre"
    placeholder="Nombre"
    value={form.nombre}
    onChange={handleInputChange}
    className="mb-1 p-2 border w-full"
  />
  {errores.nombre && <p className="text-red-500 mb-2">{errores.nombre}</p>}

  {/* Email */}
  <input
    type="email"
    name="email"
    placeholder="Email"
    value={form.email}
    onChange={handleInputChange}
    className="mb-1 p-2 border w-full"
  />
  {errores.email && <p className="text-red-500 mb-2">{errores.email}</p>}

  {/* Edad */}
  <input
    type="number"
    name="edad"
    placeholder="Edad"
    value={form.edad}
    onChange={handleInputChange}
    className="mb-1 p-2 border w-full"
  />
  {errores.edad && <p className="text-red-500 mb-2">{errores.edad}</p>}

  {/* Clave */}
  <input
    type="password"
    name="clave"
    placeholder="Clave"
    value={form.clave}
    onChange={handleInputChange}
    className="mb-1 p-2 border w-full"
  />
  {errores.clave && <p className="text-red-500 mb-2">{errores.clave}</p>}

  {/* Tipo Usuario */}
  <select
    name="id_tipo_usuario"
    value={form.id_tipo_usuario}
    onChange={handleInputChange}
    className="mb-1 p-2 border w-full"
  >
    <option value="">Selecciona Tipo Usuario</option>
    {tiposUsuario.map((tipo, idx) => (
      <option key={idx} value={tipo.id_tipo_usuario}>{tipo.descripcion_usuario}</option>
    ))}
  </select>
  {errores.id_tipo_usuario && <p className="text-red-500 mb-2">{errores.id_tipo_usuario}</p>}

  {/* Botón */}
  <button
    onClick={guardarUsuario}
    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mt-2"
  >
    {editando ? 'Guardar Cambios' : 'Crear Usuario'}
  </button>
</div>
    </div>
  );
}
