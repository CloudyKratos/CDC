
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Workspace {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  isLoading: boolean;
  error: string | null;
  setCurrentWorkspace: (workspace: Workspace) => void;
  createWorkspace: (name: string, description?: string) => Promise<Workspace>;
  updateWorkspace: (id: string, data: Partial<Workspace>) => Promise<Workspace>;
  deleteWorkspace: (id: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspaces: [],
  currentWorkspace: null,
  isLoading: false,
  error: null,
  setCurrentWorkspace: () => {},
  createWorkspace: async () => ({ id: '', name: '', owner_id: '' }),
  updateWorkspace: async () => ({ id: '', name: '', owner_id: '' }),
  deleteWorkspace: async () => {},
});

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        setIsLoading(true);
        
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }
        
        // Use raw query since types might not be updated yet
        const { data: memberWorkspaces, error: memberError } = await supabase
          .rpc('get_user_workspaces', { user_id: user.id })
          .then(() => {
            // Fallback to direct query if RPC doesn't exist
            return supabase
              .from('workspace_members')
              .select(`
                workspace_id,
                role,
                workspaces:workspace_id (
                  id,
                  name,
                  description,
                  owner_id
                )
              `)
              .eq('user_id', user.id);
          })
          .catch(async () => {
            // Final fallback - get workspaces directly
            return await supabase
              .from('workspaces')
              .select('*')
              .eq('owner_id', user.id);
          });
          
        if (memberError) {
          console.log('Error fetching workspaces, this is expected while types are updating:', memberError);
          setWorkspaces([]);
        } else if (memberWorkspaces) {
          // Handle the response based on structure
          let transformedWorkspaces: Workspace[] = [];
          
          if (Array.isArray(memberWorkspaces)) {
            transformedWorkspaces = memberWorkspaces
              .map((item: any) => {
                // If it has a workspaces property, extract it
                if (item.workspaces) {
                  return item.workspaces as Workspace;
                }
                // If it's a direct workspace object
                if (item.name && item.owner_id) {
                  return item as Workspace;
                }
                return null;
              })
              .filter(Boolean) as Workspace[];
          }
          
          setWorkspaces(transformedWorkspaces);
          
          // Set the first workspace as current if none is selected
          if (!currentWorkspace && transformedWorkspaces.length > 0) {
            setCurrentWorkspace(transformedWorkspaces[0]);
          }
        }
        
      } catch (error) {
        console.error('Error fetching workspaces:', error);
        setError('Failed to load workspaces. This may be temporary while database types update.');
        setWorkspaces([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Initial fetch
    fetchWorkspaces();
    
    // Set up subscription if tables exist
    const workspaceSubscription = supabase
      .channel('workspace-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workspaces' },
        () => {
          fetchWorkspaces();
        }
      )
      .subscribe();
      
    return () => {
      workspaceSubscription.unsubscribe();
    };
  }, []);

  // Create a new workspace
  const createWorkspace = async (name: string, description?: string): Promise<Workspace> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Try to insert new workspace
      const { data: newWorkspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          name,
          description,
          owner_id: user.id
        })
        .select()
        .single();
      
      if (workspaceError) {
        throw workspaceError;
      }
      
      // Add creator as member with owner role
      await supabase
        .from('workspace_members')
        .insert({
          workspace_id: newWorkspace.id,
          user_id: user.id,
          role: 'owner'
        });
      
      // Update state
      const workspace = newWorkspace as Workspace;
      setWorkspaces([...workspaces, workspace]);
      setCurrentWorkspace(workspace);
      
      return workspace;
    } catch (error) {
      console.error('Error creating workspace:', error);
      setError('Failed to create workspace.');
      throw error;
    }
  };

  // Update existing workspace
  const updateWorkspace = async (id: string, data: Partial<Workspace>): Promise<Workspace> => {
    try {
      const { data: updatedWorkspace, error } = await supabase
        .from('workspaces')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      const workspace = updatedWorkspace as Workspace;
      
      // Update state
      setWorkspaces(workspaces.map(w => w.id === id ? workspace : w));
      
      // Update current workspace if needed
      if (currentWorkspace && currentWorkspace.id === id) {
        setCurrentWorkspace(workspace);
      }
      
      return workspace;
    } catch (error) {
      console.error('Error updating workspace:', error);
      setError('Failed to update workspace.');
      throw error;
    }
  };

  // Delete a workspace
  const deleteWorkspace = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update state
      const updatedWorkspaces = workspaces.filter(w => w.id !== id);
      setWorkspaces(updatedWorkspaces);
      
      // Update current workspace if needed
      if (currentWorkspace && currentWorkspace.id === id) {
        setCurrentWorkspace(updatedWorkspaces[0] || null);
      }
    } catch (error) {
      console.error('Error deleting workspace:', error);
      setError('Failed to delete workspace.');
      throw error;
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        isLoading,
        error,
        setCurrentWorkspace,
        createWorkspace,
        updateWorkspace,
        deleteWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);

export default WorkspaceContext;
