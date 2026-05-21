import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { PageWrapper } from '../components/layout/PageWrapper';
import type {  User, SmartBin  } from '../types';
import { useBinStore } from '../store/binStore';
import { Loader2, Users, Database, ShieldAlert, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const AdminPage = () => {
  const { bins } = useBinStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (import.meta.env.VITE_FIREBASE_API_KEY === 'YOUR_API_KEY' || !import.meta.env.VITE_FIREBASE_API_KEY) {
          const demoUsers = JSON.parse(localStorage.getItem('demo_registered_users') || '[]');
          setUsers(demoUsers.map((u: any) => ({
            ...u,
            createdAt: { toDate: () => new Date(u.createdAt) }
          })));
        } else {
          const snapshot = await getDocs(collection(db, 'users'));
          const usersList = snapshot.docs.map(doc => doc.data() as User);
          setUsers(usersList);
        }
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.role === 'admin').length;
  
  return (
    <PageWrapper title="Admin Panel">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Users</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalUsers}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400">
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Admins</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{adminUsers}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
            <Database size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Bins</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{bins.length}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600 dark:text-orange-400">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Alerts</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">...</h3>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">User Management</h2>
        </div>
        
        <div className="overflow-x-auto">
          {loadingUsers ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="animate-spin text-green-500" size={32} />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {users.map((u) => (
                  <tr key={u.uid} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {u.displayName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {u.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        u.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {u.createdAt ? formatDistanceToNow(u.createdAt.toDate(), { addSuffix: true }) : 'Unknown'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};
