import { Outlet } from 'react-router-dom';
import Menu from '../components/Menu';

export default function TecnicoLayout() {
  return (
    <div className="flex flex-col md:flex-row w-full overflow-x-hidden">
      <Menu perfil="TÉCNICO" />
      <div className="flex-1 p-4 md:p-6 bg-gray-100 min-h-screen pt-[72px] md:pt-6 w-full max-w-full overflow-x-hidden">
        <Outlet />
      </div>
    </div>
  );
}
