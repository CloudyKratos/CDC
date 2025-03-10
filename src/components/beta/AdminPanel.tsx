
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, UserPlus, Check, X, Eye } from "lucide-react";

type WaitlistRequest = {
  id: string;
  name: string;
  email: string;
  reason: string;
  company: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
};

type BetaTester = {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string;
  lastLogin?: string;
};

const AdminPanel = () => {
  const [waitlistRequests, setWaitlistRequests] = useState<WaitlistRequest[]>([]);
  const [betaTesters, setBetaTesters] = useState<BetaTester[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<WaitlistRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    // Load waitlist requests from localStorage
    const storedRequests = JSON.parse(localStorage.getItem('waitlistRequests') || '[]');
    setWaitlistRequests(storedRequests);

    // Load beta testers from localStorage, falling back to the hardcoded list in App.tsx
    const storedTesters = JSON.parse(localStorage.getItem('betaTesters') || '[]');
    setBetaTesters(storedTesters.length ? storedTesters : [
      { id: '1', email: 'user@example.com', name: 'Demo User', role: 'Beta Tester', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
      { id: '2', email: 'jane@example.com', name: 'Jane Smith', role: 'Beta Tester', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane' },
      { id: '3', email: 'john@example.com', name: 'John Doe', role: 'Beta Tester', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
      { id: '10', email: 'robert@example.com', name: 'Robert Downey', role: 'Admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert' },
    ]);
  }, []);

  const filteredRequests = waitlistRequests.filter(request => 
    request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const approveRequest = (request: WaitlistRequest) => {
    // Create a new beta tester from the request
    const newTester: BetaTester = {
      id: `tester-${Date.now()}`,
      email: request.email,
      name: request.name,
      role: 'Beta Tester',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.name.split(' ')[0]}`
    };
    
    // Update the request status
    const updatedRequests = waitlistRequests.map(req => 
      req.id === request.id ? { ...req, status: 'approved' as const } : req
    );
    
    // Add the new tester to the list
    const updatedTesters = [...betaTesters, newTester];
    
    // Update state and localStorage
    setWaitlistRequests(updatedRequests);
    setBetaTesters(updatedTesters);
    localStorage.setItem('waitlistRequests', JSON.stringify(updatedRequests));
    localStorage.setItem('betaTesters', JSON.stringify(updatedTesters));
    
    toast.success(`Approved ${request.name}`, {
      description: `Beta access has been granted to ${request.email}`
    });
  };

  const rejectRequest = (request: WaitlistRequest) => {
    const updatedRequests = waitlistRequests.map(req => 
      req.id === request.id ? { ...req, status: 'rejected' as const } : req
    );
    
    setWaitlistRequests(updatedRequests);
    localStorage.setItem('waitlistRequests', JSON.stringify(updatedRequests));
    
    toast.info(`Rejected ${request.name}`, {
      description: `Request from ${request.email} has been rejected`
    });
  };

  const viewRequestDetails = (request: WaitlistRequest) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved':
        return <Badge variant="success" className="bg-green-500/20 text-green-400 border border-green-500/50">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-500/20 text-red-400 border border-red-500/50">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/50">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <Card className="border border-gray-800 bg-black/60 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl">Beta Testers Management</CardTitle>
          <CardDescription>
            Review and manage beta test applications and current testers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email or company..."
                className="pl-10 bg-gray-900/60 border-gray-700 text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Tester Manually
            </Button>
          </div>

          <div className="rounded-md border border-gray-800">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-400">Name</TableHead>
                  <TableHead className="text-gray-400">Email</TableHead>
                  <TableHead className="text-gray-400">Company</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Date</TableHead>
                  <TableHead className="text-gray-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.name}</TableCell>
                      <TableCell>{request.email}</TableCell>
                      <TableCell>{request.company || "-"}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-gray-400">{new Date(request.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => viewRequestDetails(request)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View details</span>
                          </Button>
                          {request.status === 'pending' && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => approveRequest(request)}
                                className="h-8 w-8 p-0 text-green-500 hover:text-green-600 hover:bg-green-500/20"
                              >
                                <Check className="h-4 w-4" />
                                <span className="sr-only">Approve</span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => rejectRequest(request)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/20"
                              >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Reject</span>
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-gray-400">
                      {searchQuery ? "No matching requests found." : "No waitlist requests yet."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="bg-gray-900 border border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription className="text-gray-400">
              Review the full details of this beta application.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">Name</p>
                  <p className="font-medium">{selectedRequest.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="font-medium">{selectedRequest.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">Company</p>
                  <p className="font-medium">{selectedRequest.company || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">Role</p>
                  <p className="font-medium">{selectedRequest.role || "-"}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-xs text-gray-400">Status</p>
                  <p className="font-medium">{getStatusBadge(selectedRequest.status)}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-xs text-gray-400">Application Date</p>
                  <p className="font-medium">{new Date(selectedRequest.date).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="space-y-1 pt-2 border-t border-gray-800">
                <p className="text-xs text-gray-400">Reason for Joining</p>
                <p className="text-sm whitespace-pre-wrap">{selectedRequest.reason}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            {selectedRequest && selectedRequest.status === 'pending' && (
              <div className="flex gap-2 w-full">
                <Button 
                  variant="outline" 
                  className="flex-1 border-red-500/30 text-red-400 hover:bg-red-950 hover:text-red-300"
                  onClick={() => {
                    rejectRequest(selectedRequest);
                    setIsDetailsOpen(false);
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button 
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  onClick={() => {
                    approveRequest(selectedRequest);
                    setIsDetailsOpen(false);
                  }}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
