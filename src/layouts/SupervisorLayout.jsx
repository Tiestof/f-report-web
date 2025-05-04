import Menu from '../components/Menu';
import { Outlet } from 'react-router-dom';

export default function SupervisorLayout() {
  return (
    <div className="flex">
      <Menu perfil="SUPERVISOR" />
      <div className="flex-1 p-6 bg-gray-100 min-h-screen pt-[72px] md:pt-6">
        <Outlet />
      </div>
    </div>
  );
}
