
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Gift, IndianRupee, Loader2, Mail } from 'lucide-react';
import type { User } from '@/types';
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
      toast({ variant: 'destructive', title: 'Insufficient Coins', description: `You need ${REDEMPTION_COST} coins.` });
      return;
    }
    
    let recipient = '';
    if (type === 'google_play') {
        if (!email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
            toast({ variant: 'destructive', title: 'Invalid Email', description: 'Please enter a valid email.' });
            return;
        }
        recipient = email;
    } else if (type === 'upi') {
        if (!upiId.match(/^[\\w.-]+@[\\w.-]+$/)) {
            toast({ variant: 'destructive', title: 'Invalid UPI ID', description: 'Please enter a valid UPI ID.' });
            return;
        }
        recipient = upiId;
    }
    
    setIsRedeeming(true);
    
    // In a real app, this should be an atomic transaction, likely using a server-side function.
    // Here we do two separate operations for simplicity.
    try {
      // 1. Create the redemption request.
      const { error: requestError } = await supabase.from('redemption_requests').insert({
        username: user.username,
        type: type,
        recipient: recipient,
        amount: REDEMPTION_COST,
      });

      if (requestError) throw requestError;
      
      // 2. Deduct coins from the user.
      const newCoins = user.mythicalCoins - REDEMPTION_COST;
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ mythical_coins: newCoins })
        .eq('id', user.id);
      
      if (userUpdateError) {
        // This is a tricky state. The request was created, but coin deduction failed.
        // A server-side transaction would prevent this. We'll notify the user.
        console.error("Critical Error: Failed to deduct coins after creating redemption request.", userUpdateError);
        toast({
            variant: "destructive",
            title: "Partial Error",
            description: "Your request was sent, but your coin balance failed to update. Please contact support.",
        });
        // We still update the UI locally to reflect the deduction, as the request is in the system.
      }
      
      // 3. Update UI optimistically.
      const updatedUser = { ...user, mythicalCoins: newCoins };
      setUser(updatedUser);
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new CustomEvent('sessionStorageChange'));
      
      toast({
        title: 'Request Submitted!',
        description: 'Your request is being processed and you should receive your reward within 24 hours.',
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
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3"><Gift className="h-8 w-8 text-primary" />Google Play Code</CardTitle>
            <CardDescription>Get a Google Play gift code sent to your email.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-6 pt-4">
             <div className="text-xl font-bold text-accent"><span>{REDEMPTION_COST} Coins = ₹10 Code</span></div>
             <div className="w-full px-4">
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" disabled={isRedeeming}/>
                </div>
            </div>
            <Button size="lg" className="h-12 text-lg px-8" onClick={() => handleRedemption('google_play')} disabled={isRedeeming || user.mythicalCoins < REDEMPTION_COST || !email}>
              {isRedeeming ? <Loader2 className="animate-spin" /> : `Redeem for ${REDEMPTION_COST}`}
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3"><IndianRupee className="h-8 w-8 text-primary" />UPI Cash</CardTitle>
            <CardDescription>Get cash directly in your bank account via UPI.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-6 pt-4">
            <div className="text-xl font-bold text-accent"><span>{REDEMPTION_COST} Coins = ₹10 Cash</span></div>
            <div className="w-full px-4">
              <Input type="text" placeholder="Enter your UPI ID" value={upiId} onChange={(e) => setUpiId(e.target.value)} disabled={isRedeeming} />
            </div>
            <Button size="lg" className="h-12 text-lg px-8" onClick={() => handleRedemption('upi')} disabled={isRedeeming || user.mythicalCoins < REDEMPTION_COST || !upiId}>
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
