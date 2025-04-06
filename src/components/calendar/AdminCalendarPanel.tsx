
import React from 'react';
import CalendarPanel from '@/components/CalendarPanel';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';

const AdminCalendarPanel = () => {
  return (
    <div className="relative h-full">
      <div className="absolute top-4 right-4 z-10">
        <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800 flex items-center gap-1.5 px-3 py-1.5">
          <ShieldCheck size={14} />
          <span>Admin View</span>
        </Badge>
      </div>
      <CalendarPanel isAdminView={true} />
    </div>
  );
};

export default AdminCalendarPanel;
