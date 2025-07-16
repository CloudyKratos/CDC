
import React, { useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Save, X } from 'lucide-react';

interface UnsavedChangesGuardProps {
  hasUnsavedChanges: boolean;
  onSave: () => void;
  onDiscard: () => void;
  isSaving?: boolean;
}

export const UnsavedChangesGuard: React.FC<UnsavedChangesGuardProps> = ({
  hasUnsavedChanges,
  onSave,
  onDiscard,
  isSaving = false
}) => {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (hasUnsavedChanges) {
        const confirmLeave = window.confirm(
          'You have unsaved changes. Are you sure you want to leave this page?'
        );
        if (!confirmLeave) {
          e.preventDefault();
          // Push the current state back to prevent navigation
          window.history.pushState(null, '', window.location.pathname);
        }
      }
    };

    if (hasUnsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges]);

  if (!hasUnsavedChanges) {
    return null;
  }

  return (
    <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 sticky top-0 z-10 shadow-md">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <span className="text-amber-800 dark:text-amber-200 font-medium">
            You have unsaved changes
          </span>
          <span className="text-amber-600 dark:text-amber-400 text-sm">
            Save your changes to avoid losing them
          </span>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onDiscard}
            disabled={isSaving}
            className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/30"
          >
            <X className="h-3 w-3 mr-1" />
            Discard
          </Button>
          <Button
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isSaving ? (
              <>
                <div className="animate-spin h-3 w-3 mr-1 border border-white border-t-transparent rounded-full" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-3 w-3 mr-1" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
