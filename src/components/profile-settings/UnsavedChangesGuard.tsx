
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Save, X } from 'lucide-react';

interface UnsavedChangesGuardProps {
  hasUnsavedChanges: boolean;
  onSave: () => void | Promise<void>;
  onDiscard: () => void;
  isSaving?: boolean;
}

export const UnsavedChangesGuard: React.FC<UnsavedChangesGuardProps> = ({
  hasUnsavedChanges,
  onSave,
  onDiscard,
  isSaving = false
}) => {
  if (!hasUnsavedChanges) {
    return null;
  }

  return (
    <Alert className="border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>You have unsaved changes. Save them before leaving or they will be lost.</span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onDiscard}
            disabled={isSaving}
            className="h-8"
          >
            <X className="h-3 w-3 mr-1" />
            Discard
          </Button>
          <Button
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className="h-8 bg-orange-600 hover:bg-orange-700"
          >
            <Save className="h-3 w-3 mr-1" />
            {isSaving ? 'Saving...' : 'Save Now'}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
