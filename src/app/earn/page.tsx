
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gem, Loader2, PlayCircle, Star, Link } from 'lucide-react';
import type { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';

export default function EarnPage() {
  const [user, setUser] = useState<User | null>(null);
  const [timer, setTimer] = useState(0);
  const [currentAdLink, setCurrentAdLink] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

  const handleEarnCoins = async () => {
    if (isSaving || !user) return;

    setIsSaving(true);

    const amount = currentAdLink === 'https://www.profitableratecpm.com/myfed6uh?key=728c96650e7d438726a7c1ba5d80683e' ? 10 : 20;

    const newCoins = user.mythicalCoins + amount;

    // Optimistically update the UI
    const updatedUser = { ...user, mythicalCoins: newCoins };
    setUser(updatedUser);
    sessionStorage.setItem('user', JSON.stringify(updatedUser));
    window.dispatchEvent(new CustomEvent('sessionStorageChange'));

    try {
      // Update the database
      const { error } = await supabase
        .from('users')
        .update({ mythical_coins: newCoins })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: 'Coins Earned!',
        description: `You've earned ${amount} MythicalCoins.`,
      });

    } catch (error) {
      console.error("Failed to update coins:", error);
      toast({
        variant: "destructive",
        title: "Sync Error",
        description: "Could not save your new coin balance. Reverting.",
      });
      // Revert optimistic update on failure
      setUser(user);
      sessionStorage.setItem('user', JSON.stringify(user));
      window.dispatchEvent(new CustomEvent('sessionStorageChange'));
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isWatching && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (isWatching && timer === 0) {
      setIsWatching(false);
      handleEarnCoins();
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isWatching, timer]);

  const handleWatchAd = () => {
    // Alternate between the two ad links
    const link1 = 'https://www.profitableratecpm.com/myfed6uh?key=728c96650e7d438726a7c1ba5d80683e';
    const link2 = 'https://understoodwestteeth.com/siwk3vqaed?key=a606cb6429fdee83e48196638e94cd15';
    const nextAdLink = currentAdLink === link1 ? link2 : link1;
    
    // Set state for handleEarnCoins to use
    setCurrentAdLink(nextAdLink);

    // Instantly open the ad link in a new tab
    window.open(nextAdLink, '_blank');

    // Start the timer on our page
    setIsWatching(true);
    setTimer(10);
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <PlayCircle className="h-8 w-8 text-primary" />
              <span className="text-2xl">Watch & Earn</span>
            </CardTitle>
            <CardDescription>Click the button, and after 10 seconds, you'll receive a reward.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-6 pt-4">
            <div className="flex items-center gap-2 text-2xl font-bold text-accent">
              <Gem className="h-7 w-7" />
              <span>Reward: Up to 20 MythicalCoins</span>
            </div>

            {!isWatching ? (
              <Button size="lg" className="h-14 text-xl px-10" onClick={handleWatchAd} disabled={isSaving}>
                { isSaving ? <Loader2 className="animate-spin" /> : 'Watch Ad' }
              </Button>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-lg font-semibold">Time remaining: {timer} seconds</p>
                <p className="text-sm text-muted-foreground">
                  Your reward will be credited automatically. Do not download anything from the links.
                </p>
              </div>
            )}

            <p className="text-xs text-muted-foreground max-w-md text-center">
              This is a timer-based reward. You must wait for the timer to complete.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Link className="h-8 w-8 text-primary" />
              <span className="text-2xl">Complete Link Task</span>
            </CardTitle>
            <CardDescription>
              Click the link, complete the task, and your reward will be added when you return.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-6 pt-4">
            <div className="flex items-center gap-2 text-2xl font-bold text-accent">
              <Gem className="h-7 w-7" />
              <span>Reward: 10 MythicalCoins</span>
            </div>

            <Button asChild size="lg" className="h-14 text-xl px-10">
              <a href="https://link-hub.net/1368158/KQnjB6gXBEqt" target="_blank" rel="noopener noreferrer">
                Start Task
              </a>
            </Button>

            <p className="text-xs text-muted-foreground max-w-md text-center">
              Your reward is processed automatically via a redirect page after task completion.
            </p>
          </CardContent>
        </Card>
      </div>

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
