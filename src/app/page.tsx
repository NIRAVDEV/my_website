"use client";

import { useState, useEffect } from 'react';
import LoginScreen from '@/components/login-screen';
import GalleryScreen from '@/components/gallery-screen';
import type { Photo } from '@/types';

const SECRET_CODE = process.env.NEXT_PUBLIC_SECRET_CODE || "WhiteSaucePasta";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const sessionActive = sessionStorage.getItem('isLoggedIn') === 'true';
    if (sessionActive) {
      setIsLoggedIn(true);
      const storedPhotos = JSON.parse(sessionStorage.getItem('photos') || '[]');
      setPhotos(storedPhotos);
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
    sessionStorage.removeItem('photos');
    setIsLoggedIn(false);
    setPhotos([]);
  };

  const handleAddPhoto = (photo: Photo) => {
    const updatedPhotos = [...photos, photo];
    setPhotos(updatedPhotos);
    sessionStorage.setItem('photos', JSON.stringify(updatedPhotos));
  };

  if (!isClient) {
    return null; // or a loading spinner
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <GalleryScreen photos={photos} onLogout={handleLogout} onAddPhoto={handleAddPhoto} />;
}
