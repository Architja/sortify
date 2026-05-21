import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { PageWrapper } from '../components/layout/PageWrapper';
import type {  CollectionRecord, SmartBin  } from '../types';
import { useBinStore } from '../store/binStore';
import { useAuthStore } from '../store/authStore';
import { Loader2, Download, Search } from 'lucide-react';
import { format } from 'date-fns';
import Papa from 'papaparse';

export const CollectionsPage = () => {
  const { bins } = useBinStore();
  const { user } = useAuthStore();
  const [collections, setCollections] = useState<CollectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        if (!user) return;
        if (import.meta.env.VITE_FIREBASE_API_KEY === 'YOUR_API_KEY' || !import.meta.env.VITE_FIREBASE_API_KEY) {
          const storageKey = `demo_collections_${user.uid}`;
          let savedCollections = JSON.parse(localStorage.getItem(storageKey) || 'null');
          
          if (!savedCollections) {
            // Fresh new sandbox data for new users
            savedCollections = [
              {
                id: `mock-col-1-${user.uid}`,
                binId: bins[0]?.id || 'demo-bin-1',
                collectedBy: user.email || 'Admin Worker',
                fillAtCollection: 95,
                collectedAt: new Date(Date.now() - 86400000).toISOString(),
                notes: 'Routine collection, bin was full'
              },
              {
                id: `mock-col-2-${user.uid}`,
                binId: bins[1]?.id || 'demo-bin-2',
                collectedBy: user.email || 'Admin Worker',
                fillAtCollection: 88,
                collectedAt: new Date(Date.now() - 172800000).toISOString(),
                notes: 'Collected early due to festival'
              }
            ];
            localStorage.setItem(storageKey, JSON.stringify(savedCollections));
          }
          
          setCollections(savedCollections.map((c: any) => ({
            ...c,
            collectedAt: { toDate: () => new Date(c.collectedAt) }
          })));
        } else {
          const q = query(collection(db, 'collections'), orderBy('collectedAt', 'desc'));
          const snapshot = await getDocs(q);
          const list = snapshot.docs.map(doc => doc.data() as CollectionRecord);
          setCollections(list);
        }
      } catch (error) {
        console.error("Failed to fetch collections", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  const getBinName = (binId: string) => {
    return bins.find(b => b.id === binId)?.name || 'Unknown Bin';
  };

  const filteredCollections = collections.filter(c => {
    const binName = getBinName(c.binId).toLowerCase();
    return binName.includes(searchTerm.toLowerCase());
  });

  const exportCSV = () => {
    const data = filteredCollections.map(c => ({
      ID: c.id,
      'Bin Name': getBinName(c.binId),
      'Collected By': c.collectedBy,
      'Fill Level (%)': c.fillAtCollection,
      'Date': c.collectedAt ? format(c.collectedAt.toDate(), 'yyyy-MM-dd HH:mm:ss') : 'Unknown',
      'Notes': c.notes || ''
    }));

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `collections_export_${format(new Date(), 'yyyyMMdd')}.csv`;
    link.click();
  };

  return (
    <PageWrapper title="Collection History">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-[calc(100vh-14rem)]">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 dark:bg-gray-900/50">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by bin name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-green-500 focus:border-green-500"
            />
          </div>
          
          <button
            onClick={exportCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium text-sm rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
        
        <div className="overflow-x-auto flex-1">
          {loading ? (
            <div className="h-full flex items-center justify-center p-12">
              <Loader2 className="animate-spin text-green-500" size={32} />
            </div>
          ) : filteredCollections.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white dark:bg-gray-800 shadow-sm z-10">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">Date & Time</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">Bin Name</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">Fill at Collection</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredCollections.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {c.collectedAt ? format(c.collectedAt.toDate(), 'MMM dd, yyyy HH:mm') : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {getBinName(c.binId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                        {c.fillAtCollection}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      {c.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 space-y-4">
              <p>No collection records found.</p>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};
