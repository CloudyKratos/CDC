
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Coins, ArrowRight, Zap } from 'lucide-react';

const ArenaInfo: React.FC = () => {
  return (
    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          <CardTitle className="text-yellow-800">Earn Coins in CDC's Arena</CardTitle>
        </div>
        <CardDescription className="text-yellow-700">
          Complete daily challenges and activities to unlock premium content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
              <Zap className="w-3 h-3 mr-1" />
              Daily Warrior Space
            </Badge>
            <ArrowRight className="w-4 h-4 text-yellow-600" />
            <div className="flex items-center gap-1 text-yellow-700 font-semibold">
              <Coins className="w-4 h-4" />
              20 Coins
            </div>
          </div>
        </div>
        
        <div className="pt-2 border-t border-yellow-200">
          <p className="text-sm text-yellow-700 mb-3">
            Use your earned coins to unlock exclusive courses, workshop recordings, and premium content.
          </p>
          <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white">
            Visit Arena
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArenaInfo;
