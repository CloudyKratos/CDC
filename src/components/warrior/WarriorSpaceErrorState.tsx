
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface WarriorSpaceErrorStateProps {
  error: string;
}

const WarriorSpaceErrorState = ({ error }: WarriorSpaceErrorStateProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <Card className="bg-red-900/30 border-red-800/40 text-white backdrop-blur-sm shadow-xl max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-red-400">Error Loading Warrior Space</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-300 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full bg-red-600 hover:bg-red-700"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default WarriorSpaceErrorState;
