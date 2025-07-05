import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/header';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Mythic Vault',
  description: 'Your secure gallery and reward center.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
        {/* Commented out banner ad script */}
        <Script src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2381415266328532" crossOrigin='anonymous'/>
        {/* Commented out highperformanceformat ad script */}
        <Script src="//www.highperformanceformat.com/c44fcd23ec37605b7c29e81c6be197fd/invoke.js" strategy="afterInteractive" />
        {/* Click to earn ad script */}
 <Script
 id="click-to-earn-ad-script"
 strategy="afterInteractive"
 dangerouslySetInnerHTML={{
 }}
 />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <Header />
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
