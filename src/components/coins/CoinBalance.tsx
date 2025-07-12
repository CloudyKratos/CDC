
import React from 'react';
import { Coins } from 'lucide-react';
import { useCoins } from '@/hooks/useCoins';

interface CoinBalanceProps {
  showDetails?: boolean;
  className?: string;
}

const CoinBalance: React.FC<CoinBalanceProps> = ({ showDetails = false, className = '' }) => {
  const { coins, loading } = useCoins();

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-5 h-5 bg-muted rounded-full"></div>
          <div className="w-12 h-4 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 px-3 py-1.5 rounded-full border border-yellow-500/20">
        <Coins className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
        <span className="font-semibold text-yellow-700 dark:text-yellow-300">
          {coins.balance.toLocaleString()}
        </span>
      </div>
      
      {showDetails && (
        <div className="text-xs text-muted-foreground">
          <div>Earned: {coins.total_earned}</div>
          <div>Spent: {coins.total_spent}</div>
        </div>
      )}
    </div>
  );
};

export default CoinBalance;
