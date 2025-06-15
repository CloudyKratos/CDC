
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

const WelcomeBanner = () => {
  return (
    <div className="mb-8">
      <Card className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-purple-700/30 text-white backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-400" />
            Welcome to Your Warrior Journey!
          </CardTitle>
          <CardDescription className="text-purple-200">
            You're about to embark on a transformative journey. Complete your first quest below to begin building your legacy.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};

export default WelcomeBanner;
