
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, TrendingDown, History } from 'lucide-react';
import { useCoins } from '@/hooks/useCoins';

const CoinWallet: React.FC = () => {
  const { coins, loading } = useCoins();

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-8 bg-muted rounded w-1/4"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Coin Wallet</h2>
        <p className="text-muted-foreground">Manage your CDC Arena coins</p>
      </div>

      {/* Current Balance */}
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <Coins className="w-5 h-5" />
            Current Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-yellow-900">
            {coins.balance} Coins
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Total Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {coins.total_earned}
            </div>
            <p className="text-xs text-muted-foreground">
              From Arena activities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-600" />
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {coins.total_spent}
            </div>
            <p className="text-xs text-muted-foreground">
              On premium content
            </p>
          </CardContent>
        </Card>
      </div>

      {/* How to Earn More Coins */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            How to Earn Coins
          </CardTitle>
          <CardDescription>
            Complete activities in CDC's Arena to earn more coins
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">Daily Warrior Space</p>
              <p className="text-sm text-muted-foreground">Complete daily challenges</p>
            </div>
            <Badge className="bg-yellow-100 text-yellow-800">
              20 Coins
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">Quest Completion</p>
              <p className="text-sm text-muted-foreground">Finish special quests</p>
            </div>
            <Badge className="bg-yellow-100 text-yellow-800">
              50+ Coins
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">Event Participation</p>
              <p className="text-sm text-muted-foreground">Join community events</p>
            </div>
            <Badge className="bg-yellow-100 text-yellow-800">
              10-30 Coins
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoinWallet;
