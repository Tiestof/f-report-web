import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import SupervisorLayout from './layouts/SupervisorLayout';
import DashboardSupervisor from './pages/DashboardSupervisor';
import GestionUsuarios from './pages/GestionUsuarios';
import Tecnico from './pages/Tecnico';
import CrearTarea from './pages/CrearTarea';
import Informes from './pages/Informes';
import VerTareasReportes from './pages/VerTareasReportes';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/tecnico" element={<Tecnico />} />

        <Route path="/supervisor" element={<SupervisorLayout />}>
          <Route index element={<DashboardSupervisor />} />
          <Route path="usuarios" element={<GestionUsuarios />} />
          <Route path="informes" element={<Informes />} />
          <Route path="ver-tareas-reportes" element={<VerTareasReportes />} />
        </Route>

        <Route path="/supervisor" element={<SupervisorLayout />}>
          <Route index element={<DashboardSupervisor />} />
          <Route path="usuarios" element={<GestionUsuarios />} />
          <Route path="crear-tarea" element={<CrearTarea />} />
        </Route>
        
      </Routes>
    </Router>
  );
}
