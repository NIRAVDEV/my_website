
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Gift, IndianRupee, Loader2, Mail } from 'lucide-react';
import type { User, RedemptionRequest } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';

const REDEMPTION_COST = 1000;

export default function RedeemPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    } else {
      router.replace('/login?from=/redeem');
    }
  }, [router]);

  const handleRedemption = async (type: 'google_play' | 'upi') => {
    if (!user || user.mythicalCoins < REDEMPTION_COST) {
      toast({
        variant: 'destructive',
        title: 'Insufficient Coins',
        description: `You need at least ${REDEMPTION_COST} MythicalCoins to redeem.`,
      });
      return;
    }
    
    let recipient = '';
    if (type === 'google_play') {
        if (!email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
            toast({ variant: 'destructive', title: 'Invalid Email', description: 'Please enter a valid email address.' });
            return;
        }
        recipient = email;
    }

    if (type === 'upi') {
        if (!upiId.match(/^[\\w.-]+@[\\w.-]+$/)) {
            toast({ variant: 'destructive', title: 'Invalid UPI ID', description: 'Please enter a valid UPI ID (e.g., yourname@bank).' });
            return;
        }
        recipient = upiId;
    }
    
    setIsRedeeming(true);
    
    try {
      // 1. Create the request object for Supabase
      const newRequest = {
        username: user.username,
        type: type,
        recipient: recipient,
        amount: REDEMPTION_COST,
        // status, id, and created_at are handled by the database
      };
      
      // 2. Save request to Supabase
      const { error } = await supabase.from('redemption_requests').insert(newRequest);

      if (error) {
        throw error;
      }
      
      // 3. Update user's coin balance locally
      // In a real app, coin balance would also be stored in the database.
      const updatedUser = { ...user, mythicalCoins: user.mythicalCoins - REDEMPTION_COST };
      setUser(updatedUser);
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new CustomEvent('sessionStorageChange'));
      
      // 4. Notify user
      toast({
        title: 'Request Submitted!',
        description: 'Your request is being processed. You will receive your reward within 24 hours.',
      });

      setEmail('');
      setUpiId('');

    } catch (error) {
       console.error("Redemption failed:", error);
       toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'There was an error submitting your request. Please try again.',
       });
    } finally {
      setIsRedeeming(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-4 text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Redeem Your Coins</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          You have <span className="font-bold text-primary">{user.mythicalCoins}</span> MythicalCoins.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Google Play Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Gift className="h-8 w-8 text-primary" />
              <span className="text-2xl">Google Play Code</span>
            </CardTitle>
            <CardDescription>Get a Google Play gift code sent to your email.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-6 pt-4">
             <div className="flex items-center gap-2 text-xl font-bold text-accent">
              <span>{REDEMPTION_COST} Coins = ₹10 Code</span>
            </div>
             <div className="w-full px-4">
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        type="email" 
                        placeholder="Enter your email address" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 text-center"
                        disabled={isRedeeming}
                    />
                </div>
            </div>
            <Button 
              size="lg" 
              className="h-12 text-lg px-8" 
              onClick={() => handleRedemption('google_play')}
              disabled={isRedeeming || user.mythicalCoins < REDEMPTION_COST || !email}
            >
              {isRedeeming ? <Loader2 className="animate-spin" /> : `Redeem for ${REDEMPTION_COST}`}
            </Button>
          </CardContent>
        </Card>

        {/* UPI Cash Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <IndianRupee className="h-8 w-8 text-primary" />
              <span className="text-2xl">UPI Cash</span>
            </CardTitle>
            <CardDescription>Get cash directly in your bank account via UPI.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-6 pt-4">
            <div className="flex items-center gap-2 text-xl font-bold text-accent">
              <span>{REDEMPTION_COST} Coins = ₹10 Cash</span>
            </div>
            <div className="w-full px-4">
              <Input 
                type="text" 
                placeholder="Enter your UPI ID" 
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="text-center"
                disabled={isRedeeming}
              />
            </div>
            <Button 
              size="lg" 
              className="h-12 text-lg px-8" 
              onClick={() => handleRedemption('upi')}
              disabled={isRedeeming || user.mythicalCoins < REDEMPTION_COST || !upiId}
            >
              {isRedeeming ? <Loader2 className="animate-spin" /> : `Redeem for ${REDEMPTION_COST}`}
            </Button>
          </CardContent>
        </Card>
      </div>

       <div className="mt-16 text-center text-muted-foreground text-sm">
          <p><strong>Note:</strong> All redemption requests are processed manually.</p>
          <p>Please allow up to 24 hours to receive your reward after submitting a request.</p>
        </div>
    </div>
  );
}
