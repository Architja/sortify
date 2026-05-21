import { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { UploadZone } from '../components/scanner/UploadZone';
import { CameraCapture } from '../components/scanner/CameraCapture';
import { ResultCard } from '../components/scanner/ResultCard';
import { processWasteScan } from '../services/scanner.service';
import { useAuthStore } from '../store/authStore';
import type {  WasteScan  } from '../types';
import { Loader2, Camera, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

type Mode = 'select' | 'camera' | 'upload' | 'analyzing' | 'result';

export const ScannerPage = () => {
  const { user } = useAuthStore();
  const [mode, setMode] = useState<Mode>('select');
  const [result, setResult] = useState<WasteScan | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleImageSelected = async (base64Image: string) => {
    if (!user) {
      toast.error('You must be logged in to scan waste.');
      return;
    }
    
    if (mode === 'camera') {
      setIsScanning(true);
    } else {
      setMode('analyzing');
    }
    
    try {
      const scanResult = await processWasteScan(user.uid, base64Image);
      setResult(scanResult);
      setMode('result');
      
      if (scanResult.hazardLevel === 'High' || scanResult.hazardLevel === 'Hazardous') {
        toast.error(`Warning: ${scanResult.hazardLevel} Hazard Detected!`, {
          duration: 6000,
          icon: '⚠️',
        });
      } else {
        toast.success('Analysis complete!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to analyze image');
      setMode('select');
    } finally {
      setIsScanning(false);
    }
  };

  const resetScanner = () => {
    setResult(null);
    setMode('select');
  };

  return (
    <PageWrapper title="AI Waste Scanner">
      <div className="max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {mode === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <button
                onClick={() => setMode('camera')}
                className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 hover:shadow-md transition-all group"
              >
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Camera size={32} className="text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Use Camera</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center text-sm">Capture a photo of the waste item directly</p>
              </button>

              <button
                onClick={() => setMode('upload')}
                className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all group"
              >
                <div className="w-16 h-16 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload size={32} className="text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Upload Image</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center text-sm">Choose an existing photo from your device</p>
              </button>
            </motion.div>
          )}

          {mode === 'camera' && (
            <motion.div
              key="camera"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <CameraCapture 
                onImageCaptured={handleImageSelected} 
                onCancel={() => setMode('select')} 
                isScanning={isScanning}
              />
            </motion.div>
          )}

          {mode === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <UploadZone onImageSelected={handleImageSelected} />
              <button
                onClick={() => setMode('select')}
                className="mt-6 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 w-full text-center"
              >
                Cancel and return
              </button>
            </motion.div>
          )}

          {mode === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 blur-xl opacity-50 rounded-full animate-pulse" />
                <div className="relative bg-white dark:bg-gray-800 p-4 rounded-full shadow-xl">
                  <Loader2 size={48} className="animate-spin text-green-500" />
                </div>
              </div>
              <h3 className="mt-8 text-xl font-bold text-gray-900 dark:text-white animate-pulse">
                Analyzing with Gemini AI...
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Identifying waste category and hazard levels
              </p>
            </motion.div>
          )}

          {mode === 'result' && result && (
            <motion.div key="result">
              <ResultCard scanResult={result} onReset={resetScanner} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
};
