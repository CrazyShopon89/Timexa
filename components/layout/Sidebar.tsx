import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import { DashboardIcon, ProjectsIcon, MembersIcon, ReportsIcon, ProfileIcon, TasksIcon, DepartmentsIcon } from '../icons';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon, roles: [Role.Admin, Role.Member] },
    { to: '/projects', label: 'Projects', icon: ProjectsIcon, roles: [Role.Admin] },
    { to: '/tasks', label: 'Tasks', icon: TasksIcon, roles: [Role.Admin] },
    { to: '/members', label: 'Members', icon: MembersIcon, roles: [Role.Admin] },
    { to: '/departments', label: 'Departments', icon: DepartmentsIcon, roles: [Role.Admin] },
    { to: '/reports', label: 'Reports', icon: ReportsIcon, roles: [Role.Admin, Role.Member] },
    { to: '/profile', label: 'Profile', icon: ProfileIcon, roles: [Role.Admin, Role.Member] },
  ];
  
  const activeLinkClass = 'bg-blue-800 text-white';
  const inactiveLinkClass = 'text-blue-100 hover:bg-blue-600';

  return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}></div>
      <div className={`fixed md:relative z-30 inset-y-0 left-0 w-64 bg-blue-700 text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="flex items-center justify-center h-20 border-b border-blue-800">
          <h1 className="text-2xl font-bold">Biz Time Tracker</h1>
        </div>
        <nav className="mt-8">
          {navItems.filter(item => user && item.roles.includes(user.role)).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center mt-4 py-2 px-6 transition-colors duration-200 ${isActive ? activeLinkClass : inactiveLinkClass}`
              }
            >
              <item.icon className="w-6 h-6" />
              <span className="mx-3">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;