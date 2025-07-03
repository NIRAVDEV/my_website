"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Gift, IndianRupee, Loader2 } from 'lucide-react';
import type { User } from '@/types';
import { useToast } from '@/hooks/use-toast';

const REDEMPTION_COST = 1000;

export default function RedeemPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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

  const handleRedemption = (type: 'google_play' | 'upi') => {
    if (!user || user.mythicalCoins < REDEMPTION_COST) {
      toast({
        variant: 'destructive',
        title: 'Insufficient Coins',
        description: `You need at least ${REDEMPTION_COST} MythicalCoins to redeem.`,
      });
      return;
    }
    
    if (type === 'upi' && !upiId.match(/^[\\w.-]+@[\\w.-]+$/)) {
      toast({
        variant: 'destructive',
        title: 'Invalid UPI ID',
        description: 'Please enter a valid UPI ID (e.g., yourname@bank).',
      });
      return;
    }
    
    setIsRedeeming(true);
    
    // Simulate API call
    setTimeout(() => {
      const updatedUser = { ...user, mythicalCoins: user.mythicalCoins - REDEMPTION_COST };
      setUser(updatedUser);
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new CustomEvent('sessionStorageChange'));
      
      if (type === 'google_play') {
         toast({
          title: 'Redemption Successful!',
          description: `Your Google Play code: FAKE-CODE-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        });
      } else {
         toast({
          title: 'Redemption Successful!',
          description: `₹10 has been sent to ${upiId}.`,
        });
      }

      setIsRedeeming(false);
    }, 1000);
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
            <CardDescription>Redeem your coins for a Google Play gift code.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-6 pt-4">
             <div className="flex items-center gap-2 text-xl font-bold text-accent">
              <span>{REDEMPTION_COST} Coins = ₹10 Code</span>
            </div>
            <Button 
              size="lg" 
              className="h-12 text-lg px-8" 
              onClick={() => handleRedemption('google_play')}
              disabled={isRedeeming || user.mythicalCoins < REDEMPTION_COST}
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
          <p><strong>Disclaimer:</strong> This is a simulated redemption process.</p>
          <p>All rewards are for demonstration purposes only and have no real-world value.</p>
        </div>
    </div>
  );
}
