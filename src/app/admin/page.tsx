
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, UserPlus } from 'lucide-react';
import type { RedemptionRequest, User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabaseClient';

// A lightweight type for displaying users in the admin panel
type DisplayUser = { id: string; username: string; mythical_coins: number; created_at: string; };

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Redemption state
  const [requests, setRequests] = useState<RedemptionRequest[]>([]);
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  
  // User Management state
  const [users, setUsers] = useState<DisplayUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.username === 'Admin') {
        setIsAuthenticated(true);
      } else {
        router.replace('/gallery');
      }
    } else {
      router.replace('/login?from=/admin');
    }
  }, [router]);

  // Fetch both requests and users when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchRequests = async () => {
      setIsLoadingRequests(true);
      try {
        const { data, error } = await supabase
          .from('redemption_requests')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (data) {
          const parsedRequests: RedemptionRequest[] = data.map((r: any) => ({
            id: r.id,
            username: r.username,
            type: r.type,
            recipient: r.recipient,
            amount: r.amount,
            status: r.status,
            createdAt: new Date(r.created_at).getTime(),
            completedAt: r.completed_at ? new Date(r.completed_at).getTime() : undefined,
            code: r.code || undefined,
          }));
          setRequests(parsedRequests);
        }
      } catch (err) {
        const error = err as any;
        console.error("Failed to fetch requests:", error);
        toast({ variant: "destructive", title: "Error", description: error.message || "Could not load requests." });
      } finally {
        setIsLoadingRequests(false);
      }
    };
    
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, username, mythical_coins, created_at')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        const error = err as any;
        console.error("Failed to fetch users:", error);
        toast({ variant: "destructive", title: "Error", description: error.message || "Could not load users." });
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchRequests();
    fetchUsers();
  }, [isAuthenticated, toast]);

  const handleProcessRequest = async (requestId: string) => {
    const code = codes[requestId] || '';
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    if (request.type === 'google_play' && !code) {
      toast({ variant: 'destructive', title: 'Input Required', description: 'Please enter a redeem code.' });
      return;
    }
    
    setIsProcessing(prev => ({...prev, [requestId]: true}));

    try {
      const { data, error } = await supabase
        .from('redemption_requests')
        .update({ status: 'completed', completed_at: new Date().toISOString(), code: code || null })
        .eq('id', requestId)
        .select()
        .single();
      if (error) throw error;

      const completedAt = data.completed_at ? new Date(data.completed_at).getTime() : Date.now();
      setRequests(requests.map(r => r.id === requestId ? { ...r, status: 'completed', completedAt, code } : r));
      
      toast({ title: 'Request Processed', description: `Request for ${request.recipient} marked as complete.` });
    } catch(err) {
       console.error("Failed to process request:", err);
       toast({ variant: "destructive", title: "Update Failed", description: "Could not update the request." });
    } finally {
        setIsProcessing(prev => ({...prev, [requestId]: false}));
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please provide a username and password." });
      return;
    }
    setIsCreatingUser(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({ username: newUsername, password: newPassword, mythical_coins: 0 })
        .select('id, username, mythical_coins, created_at')
        .single();

      if (error) throw error;

      setUsers([data, ...users]);
      setNewUsername('');
      setNewPassword('');
      toast({ title: "User Created", description: `Account for ${newUsername} has been created.` });
    } catch (error) {
      console.error("Failed to create user:", error);
      toast({ variant: "destructive", title: "Creation Failed", description: "Could not create the user account." });
    } finally {
      setIsCreatingUser(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const completedRequests = requests.filter(r => r.status === 'completed');

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4 space-y-8">
       <div className="text-left">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl flex items-center gap-3">
            <Shield className="h-10 w-10 text-primary" /> Admin Panel
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">Manage user redemptions and accounts.</p>
      </div>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserPlus /> User Management</CardTitle>
          <CardDescription>Create new user accounts and view existing ones.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateUser} className="grid md:grid-cols-3 gap-4 mb-6 p-4 border rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="new-username">Username</Label>
              <Input id="new-username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="New username" disabled={isCreatingUser} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Password</Label>
              <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" disabled={isCreatingUser} />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full" disabled={isCreatingUser}>
                {isCreatingUser ? <Loader2 className="animate-spin" /> : 'Create User'}
              </Button>
            </div>
          </form>
          
          <h3 className="text-lg font-medium mb-2">Existing Users ({users.length})</h3>
           {isLoadingUsers ? (
            <div className="flex justify-center items-center h-24"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>MythicalCoins</TableHead>
                  <TableHead>Date Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.mythical_coins}</TableCell>
                    <TableCell>{format(new Date(user.created_at), 'PPp')}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={3} className="text-center">No users found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Redemption Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Requests ({pendingRequests.length})</CardTitle>
          <CardDescription>Review and process new redemption requests.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingRequests ? (
            <div className="flex justify-center items-center h-24"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Type</TableHead><TableHead>Recipient</TableHead><TableHead>Date</TableHead><TableHead className="w-[350px]">Action</TableHead></TableRow></TableHeader>
              <TableBody>
                {pendingRequests.length > 0 ? pendingRequests.map(req => (
                  <TableRow key={req.id}>
                    <TableCell>{req.username}</TableCell>
                    <TableCell><Badge variant={req.type === 'google_play' ? 'secondary' : 'default'}>{req.type.replace('_', ' ')}</Badge></TableCell>
                    <TableCell>{req.recipient}</TableCell>
                    <TableCell>{format(new Date(req.createdAt), 'PPp')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                         {req.type === 'google_play' ? (<Input type="text" placeholder="Enter redeem code" value={codes[req.id] || ''} onChange={(e) => setCodes(prev => ({...prev, [req.id]: e.target.value}))} disabled={isProcessing[req.id]}/>) : <div className="w-full" />}
                        <Button onClick={() => handleProcessRequest(req.id)} disabled={isProcessing[req.id]}>
                          {isProcessing[req.id] ? <Loader2 className="animate-spin" /> : 'Process'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={5} className="text-center">No pending requests.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle>Completed Requests ({completedRequests.length})</CardTitle></CardHeader>
        <CardContent>
            <Table>
                <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Type</TableHead><TableHead>Recipient</TableHead><TableHead>Processed At</TableHead><TableHead>Code/Status</TableHead></TableRow></TableHeader>
                <TableBody>
                    {completedRequests.length > 0 ? completedRequests.map(req => (
                        <TableRow key={req.id}>
                            <TableCell>{req.username}</TableCell>
                            <TableCell><Badge variant={req.type === 'google_play' ? 'secondary' : 'default'}>{req.type.replace('_', ' ')}</Badge></TableCell>
                            <TableCell>{req.recipient}</TableCell>
                            <TableCell>{req.completedAt ? format(new Date(req.completedAt), 'PPp') : '-'}</TableCell>
                            <TableCell>{req.type === 'google_play' ? (<code>{req.code}</code>) : <Badge variant="outline">Paid</Badge>}</TableCell>
                        </TableRow>
                    )) : (<TableRow><TableCell colSpan={5} className="text-center">No completed requests.</TableCell></TableRow>)}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
