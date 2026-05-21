import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info, Check } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { formatDistanceToNow } from 'date-fns';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel = ({ isOpen, onClose }: NotificationPanelProps) => {
  const { alerts, markAsRead, markAllAsRead } = useNotificationStore();

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="text-red-500" size={20} />;
      case 'warning': return <Info className="text-yellow-500" size={20} />;
      default: return <Info className="text-blue-500" size={20} />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={markAllAsRead}
                  className="p-2 text-gray-500 hover:text-green-500 rounded-full transition-colors"
                  title="Mark all as read"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <CheckCircle size={48} className="mb-4 opacity-20" />
                  <p>No notifications</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border ${
                      alert.read 
                        ? 'bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700 opacity-60' 
                        : 'bg-white border-blue-100 dark:bg-gray-800 dark:border-blue-900/50 shadow-sm'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(alert.severity)}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${alert.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100 font-medium'}`}>
                          {alert.message}
                        </p>
                        <span className="text-xs text-gray-500 mt-2 block">
                          {alert.createdAt ? formatDistanceToNow(alert.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                        </span>
                      </div>
                      {!alert.read && (
                        <button
                          onClick={() => markAsRead(alert.id)}
                          className="flex-shrink-0 text-gray-400 hover:text-blue-500 transition-colors h-fit p-1"
                          title="Mark as read"
                        >
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
