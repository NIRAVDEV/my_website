import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mountain, Video, Gem } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Welcome to Your Digital Universe
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Securely store your memories in the Green Vault, and earn MythicalCoins to unlock new possibilities.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild>
                  <Link href="/gallery">Enter Green Vault</Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link href="/earn">Earn MythicalCoins</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6 lg:gap-10">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Features</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Explore the core features of our platform.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-6 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mountain className="h-6 w-6 text-primary" />
                    Green Vault
                  </CardTitle>
                  <CardDescription>Your private and secure gallery for photos and videos. Built for privacy, designed for you.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/gallery">Go to Gallery</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gem className="h-6 w-6 text-accent" />
                    MythicalCoins
                  </CardTitle>
                  <CardDescription>Earn our exclusive virtual currency. Watch ads, complete tasks, and get rewarded.</CardDescription>
                </CardHeader>
                <CardContent>
                   <Button variant="outline" className="w-full" asChild>
                    <Link href="/earn">Start Earning</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-6 w-6 text-destructive" />
                    Video Support
                  </CardTitle>
                  <CardDescription>Not just for photos! Upload, store, and view your favorite video moments seamlessly.</CardDescription>
                </CardHeader>
                <CardContent>
                   <Button variant="outline" className="w-full" asChild>
                    <Link href="/gallery">View Videos</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex items-center justify-center w-full h-16 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 Mythic Vault. All rights reserved.</p>
      </footer>
    </div>
  );
}
