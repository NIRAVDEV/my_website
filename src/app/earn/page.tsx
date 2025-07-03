"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gem, Loader2, PlayCircle, Star } from 'lucide-react';
import type { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import AdUnit from '@/components/ad-unit';

export default function EarnPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    } else {
      router.replace('/login?from=/earn');
    }
  }, [router]);

  const handleWatchAd = () => {
    setIsWatching(true);
  };

  const handleEarnCoins = () => {
    const amount = 10;
    if (user) {
      const updatedUser = { ...user, mythicalCoins: user.mythicalCoins + amount };
      setUser(updatedUser);
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      // Dispatch custom event to notify header
      window.dispatchEvent(new CustomEvent('sessionStorageChange'));
      toast({
        title: 'Coins Earned!',
        description: `You've earned ${amount} MythicalCoins.`,
      });
    }
    setIsWatching(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-4 text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Earn MythicalCoins</h1>
        <p className="mt-4 text-lg text-muted-foreground">Complete simple tasks to earn currency for new features.</p>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <PlayCircle className="h-8 w-8 text-primary" />
            <span className="text-2xl">Watch & Earn</span>
          </CardTitle>
          <CardDescription>Watch a short promotional video to receive a reward.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6 pt-4">
          <div className="flex items-center gap-2 text-2xl font-bold text-accent">
            <Gem className="h-7 w-7" />
            <span>Reward: 10 MythicalCoins</span>
          </div>

          {!isWatching ? (
            <Button size="lg" className="h-14 text-xl px-10" onClick={handleWatchAd}>
              Watch Ad
            </Button>
          ) : (
            <>
              {/* 
                This is where you would place your ad component from your ad network.
                The onAdComplete callback should be triggered when the ad is finished,
                which then calls our handleEarnCoins function to grant the reward.
              */}
              <AdUnit onAdComplete={handleEarnCoins} />
            </>
          )}

          <p className="text-xs text-muted-foreground max-w-md text-center">
            Your ad network will provide instructions on how to integrate their ad units.
          </p>
        </CardContent>
      </Card>

      <div className="mt-16">
          <h3 className="text-2xl font-bold text-center mb-8">More Ways to Earn (Coming Soon)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="opacity-50">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Star className="h-6 w-6"/> Daily Login Bonus</CardTitle>
                      <CardDescription>Get rewarded just for visiting every day.</CardDescription>
                  </CardHeader>
              </Card>
              <Card className="opacity-50">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Star className="h-6 w-6"/> Complete a Survey</CardTitle>
                      <CardDescription>Share your opinions and earn a big coin bonus.</CardDescription>
                  </CardHeader>
              </Card>
          </div>
      </div>
    </div>
  );
}
