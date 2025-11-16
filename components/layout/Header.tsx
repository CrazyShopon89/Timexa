import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogoutIcon } from '../icons';
import { Link } from 'react-router-dom';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b-4 border-blue-600">
      <div className="flex items-center">
        <button onClick={() => setSidebarOpen(true)} className="text-gray-500 focus:outline-none md:hidden">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6H20M4 12H20M4 18H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="relative mx-4 md:mx-0">
          <h1 className="text-xl font-semibold text-gray-700">Welcome, {user?.name}!</h1>
        </div>
      </div>
      <div className="flex items-center">
        <Link to="/profile" className="flex items-center cursor-pointer" aria-label="View your profile">
            <span className="text-gray-700 mr-4 hidden sm:inline">{user?.name}</span>
            <img className="w-10 h-10 rounded-full object-cover" src={user?.avatarUrl} alt="User Avatar" />
        </Link>
        <button onClick={logout} className="ml-6 text-gray-600 hover:text-blue-600 focus:outline-none flex items-center">
            <LogoutIcon className="w-6 h-6" />
            <span className="ml-2 hidden md:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;