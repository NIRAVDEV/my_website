"use client";

import { useState, useEffect } from 'react';
import LoginScreen from '@/components/login-screen';
import GalleryScreen from '@/components/gallery-screen';
import MediaViewer from '@/components/media-viewer';
import type { Media } from '@/types';

const SECRET_CODE = process.env.NEXT_PUBLIC_SECRET_CODE || "WhiteSaucePasta";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);

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
    setSelectedMediaIndex(null);
  };

  const handleAddMedia = (media: Media) => {
    const updatedMedia = [...mediaItems, media];
    setMediaItems(updatedMedia);
  };

  const handleDeleteMedia = (id: string) => {
    const deletedIndex = mediaItems.findIndex(item => item.id === id);
    const updatedMedia = mediaItems.filter(item => item.id !== id);
    setMediaItems(updatedMedia);

    if (selectedMediaIndex === deletedIndex) {
      setSelectedMediaIndex(null);
    } else if (selectedMediaIndex !== null && selectedMediaIndex > deletedIndex) {
      setSelectedMediaIndex(selectedMediaIndex - 1);
    }
  };

  const handleOpenMedia = (index: number) => {
    setSelectedMediaIndex(index);
  };

  const handleCloseMedia = () => {
    setSelectedMediaIndex(null);
  };

  const handleNextMedia = () => {
    if (selectedMediaIndex !== null && mediaItems.length > 1) {
      setSelectedMediaIndex((prevIndex) => (prevIndex! + 1) % mediaItems.length);
    }
  };

  const handlePrevMedia = () => {
    if (selectedMediaIndex !== null && mediaItems.length > 1) {
      setSelectedMediaIndex((prevIndex) => (prevIndex! - 1 + mediaItems.length) % mediaItems.length);
    }
  };

  if (!isClient) {
    return null; // or a loading spinner
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <>
      <GalleryScreen 
        mediaItems={mediaItems} 
        onLogout={handleLogout} 
        onAddMedia={handleAddMedia}
        onDeleteMedia={handleDeleteMedia}
        onOpenMedia={handleOpenMedia}
      />
      {selectedMediaIndex !== null && (
        <MediaViewer
          mediaItems={mediaItems}
          currentIndex={selectedMediaIndex}
          onClose={handleCloseMedia}
          onNext={handleNextMedia}
          onPrev={handlePrevMedia}
        />
      )}
    </>
  );
}
