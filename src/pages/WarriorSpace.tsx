
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const WarriorSpace: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Warrior Space
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome to your personal development space, {user.name || user.email}!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Your Progress
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Level</span>
                <span className="font-semibold text-blue-600">Warrior Level 1</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Daily Quests
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" />
                <span className="text-gray-700 dark:text-gray-300">Complete morning routine</span>
              </div>
              <div className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" />
                <span className="text-gray-700 dark:text-gray-300">Review business goals</span>
              </div>
              <div className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" />
                <span className="text-gray-700 dark:text-gray-300">Network with one person</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarriorSpace;
