"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Script from 'next/script';

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
        The Google Adsense script has been added below.
        It will load when this component is displayed on the "Earn" page.
      */}
      <Script
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2381415266328532"
        strategy="lazyOnload"
        crossOrigin="anonymous"
        onLoad={() => {
          console.log('Ad script loaded. You may need to initialize your ad unit here.');
          // For example: (window.adsbygoogle = window.adsbygoogle || []).push({});
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
