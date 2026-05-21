import { useEffect, useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { BinCard } from '../components/bins/BinCard';
import { useBinStore } from '../store/binStore';
import { subscribeToBins } from '../services/bins.service';
import type {  SmartBin  } from '../types';
import { Filter, ArrowUpDown } from 'lucide-react';
import { BinDetailModal } from '../components/bins/BinDetailModal';

export const DashboardPage = () => {
  const { bins, setBins, loading, setError } = useBinStore();
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('fill'); // fill or date
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

  const filteredBins = bins
    .filter(bin => filter === 'all' || bin.status === filter)
    .sort((a, b) => {
      if (sortBy === 'fill') {
        return b.fillPercentage - a.fillPercentage;
      } else {
        return (b.lastUpdated?.toMillis() || 0) - (a.lastUpdated?.toMillis() || 0);
      }
    });

  return (
    <PageWrapper title="Smart Bin Dashboard">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center space-x-2">
          <Filter size={18} className="text-gray-500" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-2"
          >
            <option value="all">All Statuses</option>
            <option value="empty">Empty (0-39%)</option>
            <option value="medium">Medium (40-79%)</option>
            <option value="full">Full (80-100%)</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <ArrowUpDown size={18} className="text-gray-500" />
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-2"
          >
            <option value="fill">Sort by Fill Level</option>
            <option value="date">Sort by Last Updated</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 h-48 animate-pulse">
              <div className="flex justify-between">
                <div className="w-1/2 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </div>
              <div className="mt-8 space-y-4">
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredBins.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBins.map((bin, index) => (
            <BinCard key={bin.id} bin={bin} index={index} onClick={handleBinClick} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">No bins found matching the current filters.</p>
        </div>
      )}

      <BinDetailModal 
        bin={selectedBin} 
        isOpen={!!selectedBin} 
        onClose={() => setSelectedBin(null)} 
      />
    </PageWrapper>
  );
};
