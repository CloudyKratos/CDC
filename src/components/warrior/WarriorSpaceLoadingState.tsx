
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sword } from "lucide-react";

const WarriorSpaceLoadingState = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="border-b border-purple-800/30 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon" className="text-purple-300 hover:text-white">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sword className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Warrior's Space</h1>
                  <p className="text-purple-300 text-sm">Loading your command center...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-black/40 border-purple-800/30 rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="lg:col-span-3 space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 bg-black/40 border-purple-800/30 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarriorSpaceLoadingState;
