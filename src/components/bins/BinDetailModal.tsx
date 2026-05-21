import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, Battery, Trash, CheckCircle } from 'lucide-react';
import type {  SmartBin  } from '../../types';
import { QRCodeSVG } from 'qrcode.react';
import { formatDistanceToNow, format } from 'date-fns';
import { useAuthStore } from '../../store/authStore';
import { CollectionModal } from './CollectionModal';

interface BinDetailModalProps {
  bin: SmartBin | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BinDetailModal = ({ bin, isOpen, onClose }: BinDetailModalProps) => {
  const { customUser } = useAuthStore();
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);

  if (!bin || !isOpen) return null;

  const isAdmin = customUser?.role === 'admin';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{bin.name}</h2>
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mt-1">
                  <MapPin size={14} className="mr-1" />
                  <span>{bin.location}</span>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Status Overview</h3>
                  
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Fill Level</span>
                      <span className="text-xl font-bold text-gray-900 dark:text-white">{bin.fillPercentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                      <div 
                        className={`h-4 rounded-full ${
                          bin.status === 'empty' ? 'bg-green-500' : 
                          bin.status === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} 
                        style={{ width: `${bin.fillPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 mr-3">
                        <Clock size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Last Updated</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {bin.lastUpdated ? format(bin.lastUpdated.toDate(), 'PP p') : 'Unknown'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400 mr-3">
                        <CheckCircle size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Last Collected</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {bin.lastCollected ? formatDistanceToNow(bin.lastCollected.toDate(), { addSuffix: true }) : 'Never'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400 mr-3">
                        <Battery size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Battery & Health</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Good (98%)</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center border border-gray-100 dark:border-gray-700 rounded-xl p-6 bg-gray-50 dark:bg-gray-900/50">
                  <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 w-full text-center">Bin QR Code</h3>
                  <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
                    <QRCodeSVG 
                      value={`sortify://bin/${bin.id}`} 
                      size={150} 
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center px-4">
                    Scan this code to quickly access this bin's details on mobile devices.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-white dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
              
              {isAdmin && (
                <button
                  onClick={() => setIsCollectionModalOpen(true)}
                  className="px-6 py-2.5 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition-colors flex items-center shadow-sm"
                >
                  <Trash size={18} className="mr-2" />
                  Mark as Collected
                </button>
              )}
            </div>
          </motion.div>

          <CollectionModal 
            bin={bin} 
            isOpen={isCollectionModalOpen} 
            onClose={() => {
              setIsCollectionModalOpen(false);
              onClose();
            }} 
          />
        </>
      )}
    </AnimatePresence>
  );
};
