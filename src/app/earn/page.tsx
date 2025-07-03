"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gem, Loader2, PlayCircle, Star } from 'lucide-react';
import type { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

export default function EarnPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [progress, setProgress] = useState(0);
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

  // This useEffect simulates an ad being watched.
  // In a real app, your ad network's SDK would provide a callback
  // for when the ad is completed (e.g., onAdComplete). You would call
  // handleEarnCoins() inside that callback instead of using this timer.
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isWatching && progress < 100) {
      // Simulates progress, takes 5 seconds to complete
      timer = setTimeout(() => setProgress(prev => prev + 1), 50);
    } else if (progress >= 100) {
      // When "ad" is finished, award the coins.
      handleEarnCoins();
    }
    return () => clearTimeout(timer);
  }, [isWatching, progress]);


  const handleWatchAd = () => {
    setIsWatching(true);
    setProgress(1);
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
    setProgress(0);
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
            <div className="w-full max-w-sm text-center">
              {/* 
                PLACE YOUR AD UNIT HERE:
                This is where you would render your ad component from your ad network.
                The simulation logic in the useEffect hook above shows how to
                grant the reward after the ad is complete.
              */}
              <p className="mb-2 text-muted-foreground">Simulating ad playback...</p>
              <Progress value={progress} className="w-full" />
              <p className="mt-2 text-sm font-semibold">{progress}%</p>
            </div>
          )}

          <p className="text-xs text-muted-foreground max-w-md text-center">
            In a real application, this would display a video advertisement. For this demo, we simulate the ad with a progress bar.
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
