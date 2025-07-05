
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Gem } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@/types';

const REWARD_AMOUNT = 10;

export default function LinkvertiseRewardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState('Verifying your session...');

  useEffect(() => {
    const awardCoinsAndRedirect = async () => {
      const storedUser = sessionStorage.getItem('user');
      if (!storedUser) {
        setStatus('Not logged in. Redirecting to login...');
        router.replace('/login');
        return;
      }

      const user: User = JSON.parse(storedUser);
      setStatus('Awarding your coins...');

      const newCoins = user.mythicalCoins + REWARD_AMOUNT;

      try {
        // Update the database
        const { error } = await supabase
          .from('users')
          .update({ mythical_coins: newCoins })
          .eq('id', user.id);
        
        if (error) throw error;
        
        // Update local session
        const updatedUser = { ...user, mythicalCoins: newCoins };
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new CustomEvent('sessionStorageChange'));

        toast({
          title: 'Reward Claimed!',
          description: `You've earned ${REWARD_AMOUNT} MythicalCoins from Linkvertise.`,
        });

      } catch (error) {
        console.error("Failed to update coins:", error);
        toast({
          variant: "destructive",
          title: "Reward Error",
          description: "There was a problem awarding your coins. Please try again later.",
        });
      } finally {
        setStatus('Redirecting you to the gallery...');
        // Redirect to the main app page after a short delay
        setTimeout(() => {
          router.replace('/gallery');
        }, 1500);
      }
    };

    awardCoinsAndRedirect();
  }, [router, toast]);

  return (
    <div className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center bg-background p-4 text-center">
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <Gem className="h-12 w-12 text-accent" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Processing Your Reward</h1>
        <p className="text-muted-foreground">{status}</p>
      </div>
    </div>
  );
}
