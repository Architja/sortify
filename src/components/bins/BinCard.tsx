import { motion } from 'framer-motion';
import { MapPin, Clock, Battery } from 'lucide-react';
import type {  SmartBin  } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface BinCardProps {
  bin: SmartBin;
  onClick: (bin: SmartBin) => void;
  index: number;
}

export const BinCard = ({ bin, onClick, index }: BinCardProps) => {
  const getStatusColor = (percentage: number) => {
    if (percentage < 40) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'empty':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Empty</span>;
      case 'medium':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">Medium</span>;
      case 'full':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Full</span>;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      onClick={() => onClick(bin)}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{bin.name}</h3>
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mt-1">
            <MapPin size={14} className="mr-1" />
            <span className="truncate max-w-[150px]">{bin.location}</span>
          </div>
        </div>
        {getStatusBadge(bin.status)}
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fill Level</span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">{bin.fillPercentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${bin.fillPercentage}%` }}
            transition={{ type: 'spring', stiffness: 50 }}
            className={`h-2.5 rounded-full ${getStatusColor(bin.fillPercentage)}`}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center">
          <Clock size={14} className="mr-1" />
          <span>{bin.lastUpdated ? formatDistanceToNow(bin.lastUpdated.toDate(), { addSuffix: true }) : 'Unknown'}</span>
        </div>
        <div className="flex items-center">
          <Battery size={14} className="mr-1" />
          <span>Active</span>
        </div>
      </div>
    </motion.div>
  );
};
