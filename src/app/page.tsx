"use client";

import { useState, useEffect } from 'react';
import LoginScreen from '@/components/login-screen';
import GalleryScreen from '@/components/gallery-screen';
import type { Media } from '@/types';

const SECRET_CODE = process.env.NEXT_PUBLIC_SECRET_CODE || "WhiteSaucePasta";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const sessionActive = sessionStorage.getItem('isLoggedIn') === 'true';
    if (sessionActive) {
      setIsLoggedIn(true);
    }
  }, []);
  
  const handleLogin = (code: string): boolean => {
    if (code === SECRET_CODE) {
      sessionStorage.setItem('isLoggedIn', 'true');
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    sessionStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    setMediaItems([]);
  };

  const handleAddMedia = (media: Media) => {
    const updatedMedia = [...mediaItems, media];
    setMediaItems(updatedMedia);
  };

  const handleDeleteMedia = (id: string) => {
    const updatedMedia = mediaItems.filter(item => item.id !== id);
    setMediaItems(updatedMedia);
  };

  const handleUpdateMedia = (id: string, tags: string[]) => {
    const updatedMedia = mediaItems.map(item => 
      item.id === id ? { ...item, tags } : item
    );
    setMediaItems(updatedMedia);
  };

  if (!isClient) {
    return null; // or a loading spinner
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <GalleryScreen 
      mediaItems={mediaItems} 
      onLogout={handleLogout} 
      onAddMedia={handleAddMedia}
      onDeleteMedia={handleDeleteMedia}
      onUpdateMedia={handleUpdateMedia}
    />
  );
}
