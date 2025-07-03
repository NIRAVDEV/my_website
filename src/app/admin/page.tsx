
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

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [requests, setRequests] = useState<RedemptionRequest[]>([]);
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});
  const [codes, setCodes] = useState<Record<string, string>>({});
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
      const storedRequests = localStorage.getItem('redemptionRequests');
      if (storedRequests) {
        const parsedRequests: RedemptionRequest[] = JSON.parse(storedRequests);
        setRequests(parsedRequests.sort((a, b) => b.createdAt - a.createdAt));
      }
    }
  }, [isAuthenticated]);

  const handleProcessRequest = (requestId: string) => {
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

    // Simulate API call to process payment and send email
    setTimeout(() => {
      const updatedRequests = requests.map(r => 
        r.id === requestId ? { ...r, status: 'completed', completedAt: Date.now(), code } : r
      );
      localStorage.setItem('redemptionRequests', JSON.stringify(updatedRequests));
      setRequests(updatedRequests);
      
      // TODO: This is where you would call your backend to send an email.
      // For example: `await sendRedemptionEmail(request.recipient, code);`
      
      toast({
        title: 'Request Processed',
        description: `The request for ${request.recipient} has been marked as complete.`,
      });
      
      setIsProcessing(prev => ({...prev, [requestId]: false}));
    }, 1000);
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
