
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield } from 'lucide-react';
import type { RedemptionRequest } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabaseClient';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [requests, setRequests] = useState<RedemptionRequest[]>([]);
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    if (isAuthenticated) {
      const fetchRequests = async () => {
        setIsLoading(true);
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
        } catch (error) {
          console.error("Failed to fetch requests:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load requests from the database.",
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchRequests();
    }
  }, [isAuthenticated, toast]);

  const handleProcessRequest = async (requestId: string) => {
    const code = codes[requestId] || '';
    const request = requests.find(r => r.id === requestId);

    if (!request) return;

    if (request.type === 'google_play' && !code) {
      toast({
        variant: 'destructive',
        title: 'Input Required',
        description: 'Please enter a redeem code before sending.',
      });
      return;
    }
    
    setIsProcessing(prev => ({...prev, [requestId]: true}));

    try {
      // Update the request in Supabase
      const { data, error } = await supabase
        .from('redemption_requests')
        .update({ status: 'completed', completed_at: new Date().toISOString(), code: code || null })
        .eq('id', requestId)
        .select()
        .single();
      
      if (error) throw error;

      // Update local state to reflect the change instantly
      const completedAt = data.completed_at ? new Date(data.completed_at).getTime() : Date.now();
      const updatedRequests = requests.map(r => 
        r.id === requestId ? { ...r, status: 'completed', completedAt, code } : r
      );
      setRequests(updatedRequests);
      
      // TODO: This is where you would call your backend to send an email.
      // For example: `await sendRedemptionEmail(request.recipient, code);`
      
      toast({
        title: 'Request Processed',
        description: `The request for ${request.recipient} has been marked as complete.`,
      });

    } catch(err) {
       console.error("Failed to process request:", err);
       toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not update the request in the database.",
       });
    } finally {
        setIsProcessing(prev => ({...prev, [requestId]: false}));
    }
  };

  const handleCodeChange = (requestId: string, value: string) => {
    setCodes(prev => ({...prev, [requestId]: value}));
  }

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
    <div className="container mx-auto max-w-6xl py-8 px-4">
       <div className="text-left mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl flex items-center gap-3">
            <Shield className="h-10 w-10 text-primary" /> Admin Panel
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">Manage user redemption requests.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Requests ({pendingRequests.length})</CardTitle>
          <CardDescription>Review and process new redemption requests.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[350px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.length > 0 ? pendingRequests.map(req => (
                  <TableRow key={req.id}>
                    <TableCell>{req.username}</TableCell>
                    <TableCell>
                      <Badge variant={req.type === 'google_play' ? 'secondary' : 'default'}>{req.type.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell>{req.recipient}</TableCell>
                    <TableCell>{format(new Date(req.createdAt), 'PPp')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                         {req.type === 'google_play' ? (
                            <Input 
                              type="text" 
                              placeholder="Enter redeem code"
                              value={codes[req.id] || ''}
                              onChange={(e) => handleCodeChange(req.id, e.target.value)}
                              disabled={isProcessing[req.id]}
                             />
                         ) : <div className="w-full" /> }
                        <Button onClick={() => handleProcessRequest(req.id)} disabled={isProcessing[req.id]}>
                          {isProcessing[req.id] ? <Loader2 className="animate-spin" /> : 'Process'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">No pending requests.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Completed Requests ({completedRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Processed At</TableHead>
                        <TableHead>Code/Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {completedRequests.length > 0 ? completedRequests.map(req => (
                        <TableRow key={req.id}>
                            <TableCell>{req.username}</TableCell>
                            <TableCell>
                                <Badge variant={req.type === 'google_play' ? 'secondary' : 'default'}>{req.type.replace('_', ' ')}</Badge>
                            </TableCell>
                            <TableCell>{req.recipient}</TableCell>
                            <TableCell>{req.completedAt ? format(new Date(req.completedAt), 'PPp') : '-'}</TableCell>
                            <TableCell>
                                {req.type === 'google_play' ? (<code>{req.code}</code>) : <Badge variant="outline">Paid</Badge>}
                            </TableCell>
                        </TableRow>
                    )) : (
                         <TableRow>
                            <TableCell colSpan={5} className="text-center">No completed requests.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
