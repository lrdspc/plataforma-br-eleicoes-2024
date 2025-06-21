
import React from 'react';
import { NavLink } from 'react-router-dom';
import { DashboardIcon, MapIcon, ProjectsIcon, UsersIcon } from '../icons/Icons';
import { NavItem, UserRole } from '../../types';
import { ROUTES, APP_NAME } from '../../constants';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  isOpen: boolean; // For mobile responsiveness
  onClose?: () => void; // For mobile
}


const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const navItems: NavItem[] = [
    { to: ROUTES.DASHBOARD, icon: <DashboardIcon className="h-5 w-5" />, label: "Dashboard", roles: [UserRole.GERENTE_PESQUISA, UserRole.COORDENADOR_CAMPO, UserRole.ADMINISTRADOR_SISTEMA] },
    { to: ROUTES.MAP_FIELD, icon: <MapIcon className="h-5 w-5" />, label: "Mapa de Coleta", roles: [UserRole.PESQUISADOR_CAMPO, UserRole.COORDENADOR_CAMPO] },
    { to: ROUTES.PROJECTS, icon: <ProjectsIcon className="h-5 w-5" />, label: "Projetos", roles: [UserRole.GERENTE_PESQUISA, UserRole.ADMINISTRADOR_SISTEMA] },
    { to: ROUTES.USERS, icon: <UsersIcon className="h-5 w-5" />, label: "Usuários", roles: [UserRole.ADMINISTRADOR_SISTEMA] },
  ];

  const filteredNavItems = user ? navItems.filter(item => item.roles.includes(user.role)) : [];

  const handleLinkClick = () => {
    if (onClose) {
      onClose(); // Close sidebar on mobile after link click
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div onClick={onClose} className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"></div>}
      
      <aside className={`fixed md:static inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                       md:translate-x-0 w-64 bg-pbr-primary text-white flex flex-col p-4 space-y-2 
                       transition-transform duration-300 ease-in-out z-50 shadow-lg md:shadow-none`}>
        <div className="text-2xl font-inter font-bold py-4 mb-4 border-b border-blue-500 text-center">
          {APP_NAME.split(' ')[0]} <span className="font-normal">{APP_NAME.split(' ').slice(1).join(' ')}</span>
        </div>
        <nav className="flex-grow">
          <ul>
            {filteredNavItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 p-3 rounded-md hover:bg-blue-700 transition-colors duration-150 ease-in-out ${
                      isActive ? 'bg-blue-700 font-semibold' : ''
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto p-2 text-center text-xs text-blue-300">
            © {new Date().getFullYear()} {APP_NAME}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
