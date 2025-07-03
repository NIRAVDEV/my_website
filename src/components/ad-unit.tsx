"use client";

import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type AdUnitProps = {
  onAdComplete: () => void;
};

/**
 * NOTE: This is a placeholder component for an ad unit.
 * You would replace this with the actual implementation provided by your ad network.
 */
export default function AdUnit({ onAdComplete }: AdUnitProps) {
  // This function would typically be called by the ad network's SDK
  // once the ad has been successfully viewed. We are simulating it
  // with a button click for demonstration purposes.
  const handleClaimReward = () => {
    onAdComplete();
  };

  return (
    <div className="w-full max-w-sm text-center">
      {/* 
        This is where you would place the script from your ad network.
        The `onLoad` callback can be used to initialize the ad unit
        once the script is ready.
      */}
      <Script
        src="https://your-ad-network.com/ad-script.js" // <-- REPLACE with your ad network's script URL
        strategy="lazyOnload"
        onLoad={() => {
          console.log('Ad script loaded. You would initialize your ad unit here.');
          // Example: window.myAdNetwork.initAd('ad-container');
        }}
        onError={(e) => {
          console.error('Failed to load ad script', e);
        }}
      />
      
      {/* 
        This is a placeholder for where the ad would be displayed.
        Your ad network will likely provide a div ID or a component
        to render their ad.
      */}
      <Card id="ad-container" className="bg-muted aspect-video flex flex-col items-center justify-center p-4">
        <CardContent className="flex flex-col items-center justify-center space-y-4 p-0">
          <p className="text-muted-foreground">Ad Placeholder</p>
          <p className="text-xs text-muted-foreground">
            In a real app, your ad would appear here.
          </p>
          <Button onClick={handleClaimReward}>
            Simulate Ad Completion & Claim Reward
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
