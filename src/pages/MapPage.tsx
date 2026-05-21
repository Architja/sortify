import { useEffect, useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { BinMap } from '../components/bins/BinMap';
import { useBinStore } from '../store/binStore';
import { subscribeToBins } from '../services/bins.service';
import type {  SmartBin  } from '../types';
import { BinDetailModal } from '../components/bins/BinDetailModal';

export const MapPage = () => {
  const { bins, setBins, loading, setError } = useBinStore();
  const [selectedBin, setSelectedBin] = useState<SmartBin | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToBins(
      (newBins) => setBins(newBins),
      (err) => setError(err.message)
    );
    return () => unsubscribe();
  }, [setBins, setError]);

  const handleBinClick = (bin: SmartBin) => {
    setSelectedBin(bin);
  };

  return (
    <PageWrapper title="Bin Location Map">
      {loading ? (
        <div className="h-[calc(100vh-12rem)] w-full rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse flex items-center justify-center">
          <span className="text-gray-400 dark:text-gray-500 font-medium">Loading Map...</span>
        </div>
      ) : (
        <BinMap bins={bins} onBinClick={handleBinClick} />
      )}

      <BinDetailModal 
        bin={selectedBin} 
        isOpen={!!selectedBin} 
        onClose={() => setSelectedBin(null)} 
      />
    </PageWrapper>
  );
};
