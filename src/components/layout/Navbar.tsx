import { useState } from 'react';
import { Bell, Menu, X } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { NotificationPanel } from '../notifications/NotificationPanel';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = () => {
  const { unreadCount } = useNotificationStore();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sticky top-0 z-20">
        <div className="flex items-center md:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <span className="ml-2 font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-blue-500">
            Sortify
          </span>
        </div>
        
        <div className="hidden md:flex flex-1">
          {/* Breadcrumbs or Page Title could go here */}
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsNotificationsOpen(true)}
            className="relative p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-800">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <NotificationPanel 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
      />
    </>
  );
};
