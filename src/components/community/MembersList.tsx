
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";

interface Member {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  role?: 'Admin' | 'Moderator' | 'Member';
  game?: string;
}

interface MembersListProps {
  members: Member[];
  collapsed?: boolean;
}

const MembersList: React.FC<MembersListProps> = ({
  members,
  collapsed = false
}) => {
  // Group members by role and status
  const groupedMembers = members.reduce((acc, member) => {
    const roleGroup = member.role || 'Member';
    
    if (!acc[roleGroup]) {
      acc[roleGroup] = {
        online: [],
        idle: [],
        dnd: [],
        offline: []
      };
    }
    
    acc[roleGroup][member.status].push(member);
    
    return acc;
  }, {} as Record<string, Record<string, Member[]>>);
  
  // Sort roles with Admin first, then Moderator, then Member
  const sortedRoles = Object.keys(groupedMembers).sort((a, b) => {
    const roleOrder = { 'Admin': 0, 'Moderator': 1, 'Member': 2 };
    return roleOrder[a as keyof typeof roleOrder] - roleOrder[b as keyof typeof roleOrder];
  });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'dnd': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  if (collapsed) return null;
  
  return (
    <div className="w-60 border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex flex-col h-full">
      <div className="p-3 border-b border-gray-200 dark:border-gray-800">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
          <Input 
            placeholder="Search members..." 
            className="pl-8 h-8 text-sm bg-transparent" 
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        {sortedRoles.map(role => {
          const roleMembers = [
            ...groupedMembers[role].online,
            ...groupedMembers[role].idle,
            ...groupedMembers[role].dnd,
            ...groupedMembers[role].offline
          ];
          
          if (roleMembers.length === 0) return null;
          
          return (
            <div key={role} className="mb-4">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-1 uppercase">
                {role} — {roleMembers.length}
              </h4>
              
              {['online', 'idle', 'dnd', 'offline'].map(status => (
                <React.Fragment key={status}>
                  {groupedMembers[role][status].length > 0 && (
                    <>
                      {groupedMembers[role][status].map(member => (
                        <div 
                          key={member.id} 
                          className="flex items-center px-3 py-1.5 hover:bg-gray-200/60 dark:hover:bg-gray-800/60 rounded mx-1 cursor-pointer group"
                        >
                          <div className="relative">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.avatar}`} alt={member.name} />
                              <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <span 
                              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-900 ${getStatusColor(member.status)}`}
                            />
                          </div>
                          
                          <div className="ml-2 min-w-0">
                            <div className="flex items-center">
                              <p className="text-sm font-medium truncate">
                                {member.name}
                              </p>
                              {member.role && member.role !== 'Member' && (
                                <Badge 
                                  variant="outline" 
                                  className={`ml-1.5 text-[9px] py-0 h-3.5 opacity-70 hidden group-hover:inline-flex ${
                                    member.role === 'Admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800' : 
                                    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                                  }`}
                                >
                                  {member.role}
                                </Badge>
                              )}
                            </div>
                            
                            {member.game && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                Playing {member.game}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </React.Fragment>
              ))}
            </div>
          );
        })}
      </ScrollArea>
    </div>
  );
};

export default MembersList;
