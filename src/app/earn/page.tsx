"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gem, Loader2, PlayCircle, Star } from 'lucide-react';
import type { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import Script from 'next/script';
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

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isWatching && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (isWatching && timer === 0) {
      setIsWatching(false);
      handleEarnCoins();
      if (currentAdLink) {
        window.open(currentAdLink, '_blank');
      }
      setCurrentAdLink(''); // Reset the ad link after opening
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isWatching, timer, currentAdLink]); // Added currentAdLink to dependencies

  const handleWatchAd = () => {
    setIsWatching(true);
    setTimer(10); // Start a 10-second timer

    // Alternate between the two ad links
    const link1 = 'https://understoodwestteeth.com/myfed6uh?key=728c96650e7d438726a7c1ba5d80683e';
    const link2 = 'https://understoodwestteeth.com/siwk3vqaed?key=a606cb6429fdee83e48196638e94cd15';
    const nextAdLink = currentAdLink === link1 ? link2 : link1;
    setCurrentAdLink(nextAdLink);
  };

  const handleEarnCoins = async () => {
    if (isSaving || !user) return;

    setIsSaving(true);

    const amount = currentAdLink === 'https://understoodwestteeth.com/siwk3vqaed?key=a606cb6429fdee83e48196638e94cd15' ? 20 : 10; // Award 20 coins for the second link, 10 for the first

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
            <span>Reward: {currentAdLink === 'https://understoodwestteeth.com/siwk3vqaed?key=a606cb6429fdee83e48196638e94cd15' ? 20 : 10} MythicalCoins</span>
          </div>

          {!isWatching ? (
            <Button size="lg" className="h-14 text-xl px-10" onClick={handleWatchAd} disabled={isSaving}>
              { isSaving ? <Loader2 className="animate-spin" /> : 'Watch Ad' }
            </Button>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-lg font-semibold">Time remaining: {timer} seconds</p>
              <p className="text-sm text-muted-foreground">
                Please wait on the ad website for 10 seconds and click something to earn your rewards. Do not download anything from the links.
              </p>
              {/* The ad will open in a new tab */}
            </div>
          )}

          {/* The Script tags for the ads are added here */}
          <Script src="https://understoodwestteeth.com/myfed6uh?key=728c96650e7d438726a7c1ba5d80683e" strategy="afterInteractive" />
          <Script src="https://understoodwestteeth.com/siwk3vqaed?key=a606cb6429fdee83e48196638e94cd15" strategy="afterInteractive" />


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