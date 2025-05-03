import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import SupervisorLayout from './layouts/SupervisorLayout';
import DashboardSupervisor from './pages/DashboardSupervisor';
import GestionUsuarios from './pages/GestionUsuarios';
import Tecnico from './pages/Tecnico';
import CrearTarea from './pages/CrearTarea';
import Informes from './pages/Informes';
import VerTareasReportes from './pages/VerTareasReportes';
import TecnicoLayout from './layouts/TecnicoLayout';
import DashboardTecnico from './pages/Tecnico'; 
import CrearReporte from './pages/CrearReporte';
import VerTareas from "./pages/VerTareas";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* RUTA DEL TÉCNICO  */}
        <Route path="/tecnico" element={<TecnicoLayout />}>
        <Route index element={<DashboardTecnico />} />
         <Route path="crear-reporte" element={<CrearReporte />} />
         <Route path="ver-tareas" element={<VerTareas />} />
        </Route>

        {/* RUTA DEL SUPERVISOR  */}
        <Route path="/supervisor" element={<SupervisorLayout />}>
          <Route index element={<DashboardSupervisor />} />
          <Route path="usuarios" element={<GestionUsuarios />} />
          <Route path="informes" element={<Informes />} />
          <Route path="ver-tareas-reportes" element={<VerTareasReportes />} />
          <Route path="crear-tarea" element={<CrearTarea />} />
        </Route>

      </Routes>
    </Router>
  );
}
