"use client";

import { useState, useEffect } from 'react';
import LoginScreen from '@/components/login-screen';
import GalleryScreen from '@/components/gallery-screen';
import MediaViewer from '@/components/media-viewer';
import type { Media } from '@/types';
import { useToast } from '@/hooks/use-toast';

const SECRET_CODE = process.env.NEXT_PUBLIC_SECRET_CODE || "WhiteSaucePasta";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
  const [isLoadingMedia, setIsLoadingMedia] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    const sessionActive = sessionStorage.getItem('isLoggedIn') === 'true';
    if (sessionActive) {
      setIsLoggedIn(true);
    } else {
      setIsLoadingMedia(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      const fetchMedia = async () => {
        try {
          setIsLoadingMedia(true);
          const response = await fetch('/api/media');
          if (!response.ok) {
            throw new Error('Failed to fetch media');
          }
          const data: Media[] = await response.json();
          setMediaItems(data);
        } catch (error) {
          console.error(error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load media from the server.",
          });
        } finally {
          setIsLoadingMedia(false);
        }
      };
      fetchMedia();
    }
  }, [isLoggedIn, toast]);
  
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
    // Add new media to the top of the list
    setMediaItems(prevMedia => [media, ...prevMedia]);
  };

  const handleDeleteMedia = async (id: string) => {
    const originalMedia = [...mediaItems];
    const deletedIndex = mediaItems.findIndex(item => item.id === id);
    
    // Optimistically update UI
    const updatedMedia = mediaItems.filter(item => item.id !== id);
    setMediaItems(updatedMedia);

    if (selectedMediaIndex === deletedIndex) {
      setSelectedMediaIndex(null);
    } else if (selectedMediaIndex !== null && selectedMediaIndex > deletedIndex) {
      setSelectedMediaIndex(selectedMediaIndex - 1);
    }
    
    try {
      const response = await fetch('/api/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete on server');
      }
    } catch (error) {
      console.error('Failed to delete media:', error);
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: "Could not delete media. Restoring view.",
      });
      // Revert UI change on failure
      setMediaItems(originalMedia);
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
        isLoading={isLoadingMedia}
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
