
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LogoutIcon, MenuIcon, CloseIcon } from '../icons/Icons';
import Button from '../common/Button';
import { APP_NAME } from '../../constants';

interface HeaderProps {
  onToggleSidebar?: () => void; // For mobile
  isSidebarOpen?: boolean; // For mobile
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, logout, getRoleDisplayName } = useAuth();

  return (
    <header className="bg-pbr-bg-element shadow-md p-4 flex justify-between items-center sticky top-0 z-40">
      <div className="flex items-center">
        {onToggleSidebar && (
           <button onClick={onToggleSidebar} className="text-pbr-text-main mr-3 md:hidden">
            {isSidebarOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        )}
        <h1 className="text-xl font-semibold text-pbr-text-main hidden sm:block">{APP_NAME}</h1>
      </div>
      <div className="flex items-center">
        {user && (
          <div className="mr-4 text-right">
            <p className="text-pbr-text-main font-semibold text-sm sm:text-base">{user.name}</p>
            <p className="text-xs text-pbr-text-secondary">{getRoleDisplayName(user.role)}</p>
          </div>
        )}
        <Button onClick={logout} variant="ghost" size="sm" className="hover:bg-red-100 text-pbr-error focus:ring-pbr-error">
          <LogoutIcon className="h-5 w-5 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Sair</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
