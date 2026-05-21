import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2 } from 'lucide-react';
import type {  SmartBin  } from '../../types';
import { markBinAsCollected } from '../../services/bins.service';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

interface CollectionModalProps {
  bin: SmartBin | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CollectionModal = ({ bin, isOpen, onClose }: CollectionModalProps) => {
  const { user } = useAuthStore();
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!bin || !isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      await markBinAsCollected(bin.id, user.uid, bin.fillPercentage, notes);
      toast.success(`${bin.name} marked as collected`);
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark as collected');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden"
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Collect Waste</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                You are marking <span className="font-bold text-gray-900 dark:text-white">{bin.name}</span> as collected.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Current fill level: <span className="font-bold text-red-500">{bin.fillPercentage.toFixed(0)}%</span>
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Collection Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="Any issues encountered?"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg flex justify-center items-center font-medium transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <Check size={18} className="mr-2" />
                    Confirm
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
