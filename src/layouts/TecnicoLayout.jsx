import { Outlet } from 'react-router-dom';
import Menu from '../components/Menu';

export default function TecnicoLayout() {
  return (
    <div className="flex">
      <Menu perfil="TÉCNICO" />
      <div className="flex-1 p-6 bg-gray-100 min-h-screen pt-[72px] md:pt-6">
        <Outlet />
      </div>
    </div>
  );
}
