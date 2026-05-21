import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, RefreshCcw, Trash2 } from 'lucide-react';
import type {  WasteScan  } from '../../types';
import { CATEGORY_COLORS, HAZARD_COLORS } from '../../constants/wasteCategories';

interface ResultCardProps {
  scanResult: WasteScan;
  onReset: () => void;
}

export const ResultCard = ({ scanResult, onReset }: ResultCardProps) => {
  const isHazardous = scanResult.hazardLevel === 'High' || scanResult.hazardLevel === 'Hazardous';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden max-w-2xl mx-auto"
    >
      <div className="relative h-48 bg-gray-100 dark:bg-gray-900">
        <img 
          src={scanResult.imageUrl} 
          alt="Scanned waste" 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 flex space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-bold shadow-sm ${CATEGORY_COLORS[scanResult.wasteCategory]}`}>
            {scanResult.wasteCategory}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-bold shadow-sm ${HAZARD_COLORS[scanResult.hazardLevel]}`}>
            {scanResult.hazardLevel} Hazard
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isHazardous && scanResult.hazardWarning && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Hazard Warning</h3>
                <p className="text-sm text-red-700 mt-1">{scanResult.hazardWarning}</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Analysis Results</h4>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Confidence Score</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{(scanResult.confidenceScore * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${scanResult.confidenceScore * 100}%` }}
              />
            </div>
          </div>

          {scanResult.detectedItems && scanResult.detectedItems.length > 0 && (
            <div className="mb-6">
              <h5 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Detected Objects</h5>
              <div className="flex flex-wrap gap-2">
                {scanResult.detectedItems.map((item, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-800 dark:text-gray-200 font-medium">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-start">
              <RefreshCcw className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h5 className="text-sm font-semibold text-gray-900 dark:text-white">Recycling Suggestion</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{scanResult.recyclingSuggestion}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Trash2 className="h-5 w-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h5 className="text-sm font-semibold text-gray-900 dark:text-white">Disposal Recommendation</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{scanResult.disposalRecommendation}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={onReset}
            className="w-full py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-colors"
          >
            Scan Another Item
          </button>
        </div>
      </div>
    </motion.div>
  );
};
