import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map, Camera, BarChart2, List, Shield, LogOut, Clock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { logout } from '../../services/auth.service';
import { ThemeToggle } from './ThemeToggle';

export const Sidebar = () => {
  const location = useLocation();
  const { customUser, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    clearAuth();
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Map', path: '/map', icon: Map },
    { name: 'Scanner', path: '/scanner', icon: Camera },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'History', path: '/history', icon: Clock },

  ];

  if (customUser?.role === 'admin') {
    navItems.push({ name: 'Collections', path: '/collections', icon: List });
    navItems.push({ name: 'Admin Panel', path: '/admin', icon: Shield });
  }

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col">
      <div className="p-6 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-black font-bold">
            S
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-black dark:to-white">
            Sortify
          </span>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-medium' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex flex-col space-y-4">
        <div className="flex items-center justify-between px-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Theme</span>
          <ThemeToggle />
        </div>
        
        <div className="flex items-center space-x-3 px-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {customUser?.displayName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">
              {customUser?.role}
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};
