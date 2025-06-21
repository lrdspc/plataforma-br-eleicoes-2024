
import React, { ReactNode, useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  return (
    <div className="flex h-screen bg-pbr-bg-main">
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-pbr-bg-main p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
