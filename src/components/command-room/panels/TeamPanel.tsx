
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Crown, Shield, User, MessageCircle, Video, Phone } from 'lucide-react';

const TeamPanel: React.FC = () => {
  const teamMembers = [
    {
      id: 1,
      name: 'Alex Commander',
      role: 'Mission Director',
      status: 'online',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
      lastActive: 'Active now',
      permissions: ['admin', 'deploy', 'monitor']
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      role: 'Lead Engineer',
      status: 'busy',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      lastActive: '5 min ago',
      permissions: ['deploy', 'monitor']
    },
    {
      id: 3,
      name: 'Mike Chen',
      role: 'Security Specialist',
      status: 'online',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
      lastActive: 'Active now',
      permissions: ['security', 'monitor']
    },
    {
      id: 4,
      name: 'Emma Davis',
      role: 'Data Analyst',
      status: 'away',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
      lastActive: '1 hour ago',
      permissions: ['analytics', 'monitor']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-red-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleIcon = (role: string) => {
    if (role.includes('Director')) return Crown;
    if (role.includes('Security')) return Shield;
    return User;
  };

  return (
    <div className="space-y-6">
      {/* Team Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-black/20 backdrop-blur-lg border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">12</p>
                <p className="text-white/60 text-sm">Active Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/20 backdrop-blur-lg border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">8</p>
                <p className="text-white/60 text-sm">Online Now</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/20 backdrop-blur-lg border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Crown className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">3</p>
                <p className="text-white/60 text-sm">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <Card className="bg-black/20 backdrop-blur-lg border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-xl">Command Team</CardTitle>
          <CardDescription className="text-white/60">
            Active mission personnel and their current status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {teamMembers.map((member) => {
            const RoleIcon = getRoleIcon(member.role);
            
            return (
              <div key={member.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-black ${getStatusColor(member.status)}`}></div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-white font-medium">{member.name}</h4>
                      <RoleIcon className="h-4 w-4 text-blue-400" />
                    </div>
                    <p className="text-white/60 text-sm">{member.role}</p>
                    <p className="text-white/40 text-xs">{member.lastActive}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex flex-wrap gap-1">
                    {member.permissions.map((permission) => (
                      <Badge key={permission} variant="outline" className="text-xs bg-white/10 border-white/20 text-white/70">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Team Activity */}
      <Card className="bg-black/20 backdrop-blur-lg border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-xl">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { user: 'Alex Commander', action: 'deployed system update', time: '2 min ago', type: 'deploy' },
              { user: 'Sarah Johnson', action: 'completed security scan', time: '15 min ago', type: 'security' },
              { user: 'Mike Chen', action: 'updated firewall rules', time: '1 hour ago', type: 'security' },
              { user: 'Emma Davis', action: 'generated performance report', time: '2 hours ago', type: 'analytics' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                <div className={`h-2 w-2 rounded-full ${
                  activity.type === 'deploy' ? 'bg-blue-400' :
                  activity.type === 'security' ? 'bg-red-400' :
                  'bg-green-400'
                }`}></div>
                <div className="flex-1">
                  <p className="text-white text-sm">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                </div>
                <span className="text-white/60 text-xs">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamPanel;
