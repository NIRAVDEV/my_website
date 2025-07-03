import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Gem, Share2, Smartphone } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: <ShieldCheck className="h-8 w-8 text-primary" />,
      title: 'Private & Secure Vault',
      description: 'Your media is protected. Access your vault with a secure session-based login.',
    },
    {
      icon: <Share2 className="h-8 w-8 text-primary" />,
      title: 'Share with Ease',
      description: 'Share individual photos and videos with friends and family using a secure link.',
    },
    {
      icon: <Gem className="h-8 w-8 text-primary" />,
      title: 'Earn MythicalCoins',
      description: 'Complete simple tasks, like watching ads, to earn virtual currency for future features.',
    },
    {
      icon: <Smartphone className="h-8 w-8 text-primary" />,
      title: 'Mobile Ready',
      description: 'Access your gallery from any device. The interface is fully responsive for phones and tablets.',
    },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-57px)]">
      <section className="flex-grow flex flex-col items-center justify-center text-center px-4 py-12 bg-background">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
          Welcome to <span className="text-primary">MythicVault</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Your personal and secure space for photos and videos, with a touch of mythic rewards.
        </p>
        <div className="mt-8 flex gap-4">
          <Button asChild size="lg" className="h-12 px-8 text-lg">
            <Link href="/gallery">Go to Gallery</Link>
          </Button>
        </div>
      </section>

      <section className="w-full py-16 bg-muted/40">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center bg-card shadow-lg hover:shadow-primary/20 transition-shadow">
                <CardHeader>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
