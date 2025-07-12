
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { useCoins } from '@/hooks/useCoins';
import { format } from 'date-fns';

const CoinWallet: React.FC = () => {
  const { coins, transactions, loading } = useCoins();

  const getSourceLabel = (source: string) => {
    const labels: Record<string, string> = {
      warrior_space_daily: 'Warrior Space Daily',
      quest_completion: 'Quest Completed',
      course_unlock: 'Course Unlock',
      morning_upload: 'Morning Activity',
      gratitude_list: 'Gratitude List',
      community_challenge: 'Challenge'
    };
    return labels[source] || source;
  };

  const getSourceIcon = (source: string, type: 'earn' | 'spend') => {
    if (type === 'spend') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <TrendingUp className="w-4 h-4 text-green-500" />;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Coin Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-muted rounded"></div>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-yellow-600" />
          Coin Wallet
        </CardTitle>
        <CardDescription>
          Track your coin balance and transaction history
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2 mb-1">
              <Coins className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Current Balance</span>
            </div>
            <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
              {coins.balance.toLocaleString()}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">Total Earned</span>
            </div>
            <div className="text-2xl font-bold text-green-800 dark:text-green-200">
              {coins.total_earned.toLocaleString()}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Spent</span>
            </div>
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
              {coins.total_spent.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Recent Transactions
          </h3>
          
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Coins className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No transactions yet</p>
              <p className="text-sm">Complete activities in Warrior Space to earn your first coins!</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getSourceIcon(transaction.source, transaction.type)}
                    <div>
                      <div className="font-medium text-sm">
                        {getSourceLabel(transaction.source)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {transaction.description || 'No description'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`font-semibold ${
                      transaction.type === 'earn' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'earn' ? '+' : '-'}{transaction.amount}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(transaction.created_at), 'MMM d, h:mm a')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CoinWallet;
