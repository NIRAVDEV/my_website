"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Gem, LogIn, LogOut, ShieldCheck, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import type { User } from '@/types';
import { cn } from '@/lib/utils';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const handleStorageChange = () => {
      const updatedUser = sessionStorage.getItem('user');
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
    };

    window.addEventListener('storage', handleStorageChange);
    // Custom event to handle changes within the same tab
    window.addEventListener('sessionStorageChange', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sessionStorageChange', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const navLinks = [
    { href: '/gallery', label: 'Gallery' },
    { href: '/earn', label: 'Earn Coins' },
  ];

  const NavLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
    <Link href={href} className={cn(
      "transition-colors hover:text-foreground",
      pathname === href ? "text-foreground" : "text-muted-foreground"
    )}>
      {children}
    </Link>
  );
  
  if (!isClient) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <ShieldCheck className="h-6 w-6" />
              <span className="hidden font-bold sm:inline-block">MythicVault</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <div className="w-[100px] h-[20px] bg-muted animate-pulse rounded-md" />
            <div className="w-[80px] h-[40px] bg-muted animate-pulse rounded-md" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">MythicVault</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map(link => <NavLink key={link.href} href={link.href}>{link.label}</NavLink>)}
          </nav>
        </div>
        <div className="md:hidden">
           <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                 <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <SheetHeader className="sr-only">
                    <SheetTitle>Menu</SheetTitle>
                    <SheetDescription>Main navigation menu.</SheetDescription>
                </SheetHeader>
               <div className="p-4">
                 <Link href="/" className="mb-8 flex items-center space-x-2">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                    <span className="font-bold">MythicVault</span>
                  </Link>
                  <nav className="flex flex-col space-y-4">
                    {navLinks.map(link => <NavLink key={link.href} href={link.href}>{link.label}</NavLink>)}
                  </nav>
               </div>
            </SheetContent>
          </Sheet>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {user ? (
            <>
              <div className="flex items-center gap-2">
                <Gem className="h-5 w-5 text-accent" />
                <span className="font-semibold text-foreground">{user.mythicalCoins}</span>
                <span className="hidden sm:inline text-muted-foreground">Coins</span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Button asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-5 w-5" /> Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
