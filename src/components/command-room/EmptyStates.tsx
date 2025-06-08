
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Bookmark, Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";

export const BookmarksEmptyState: React.FC = () => (
  <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
    <CardContent className="flex flex-col items-center justify-center py-12">
      <Bookmark className="h-12 w-12 text-slate-400 mb-4" />
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Bookmarks Yet</h3>
      <p className="text-slate-600 dark:text-slate-400 text-center max-w-md">
        Start bookmarking resources you want to revisit later. Click the bookmark icon on any resource card.
      </p>
    </CardContent>
  </Card>
);

export const UploadArea: React.FC = () => (
  <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
    <CardContent className="space-y-4">
      <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center">
        <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Upload Your Resource
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Share valuable content with the community
        </p>
        <Button>
          <Upload className="w-4 h-4 mr-2" />
          Choose File
        </Button>
      </div>
    </CardContent>
  </Card>
);
