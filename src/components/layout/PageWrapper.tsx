import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageWrapperProps {
  children: ReactNode;
  title?: string;
}

export const PageWrapper = ({ children, title }: PageWrapperProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900"
    >
      <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-[calc(100vh-4rem)]">
        {title && (
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 md:mb-8">
            {title}
          </h1>
        )}
        {children}
      </div>
    </motion.div>
  );
};
