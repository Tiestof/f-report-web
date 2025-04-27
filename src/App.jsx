import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Supervisor from './pages/Supervisor';
import Tecnico from './pages/Tecnico';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/supervisor" element={<Supervisor />} />
        <Route path="/tecnico" element={<Tecnico />} />
      </Routes>
    </Router>
  );
}
