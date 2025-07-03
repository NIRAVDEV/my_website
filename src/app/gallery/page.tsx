"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GalleryScreen from '@/components/gallery-screen';
import MediaViewer from '@/components/media-viewer';
import type { Media } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function GalleryPage() {
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
  const [isLoadingMedia, setIsLoadingMedia] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const sessionActive = sessionStorage.getItem('user') !== null;
    if (sessionActive) {
      setIsAuthenticated(true);
    } else {
      router.replace('/login?from=/gallery');
    }
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
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
  }, [isAuthenticated, toast]);
  
  const handleAddMedia = (media: Media) => {
    setMediaItems(prevMedia => [media, ...prevMedia]);
  };

  const handleDeleteMedia = async (id: string) => {
    const originalMedia = [...mediaItems];
    const deletedIndex = mediaItems.findIndex(item => item.id === id);
    
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

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-4 text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <>
      <GalleryScreen 
        mediaItems={mediaItems}
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
