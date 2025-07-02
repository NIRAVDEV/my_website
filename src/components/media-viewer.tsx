"use client";

import Image from 'next/image';
import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { Media } from '@/types';
import { Button } from '@/components/ui/button';

type MediaViewerProps = {
  mediaItems: Media[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
};

export default function MediaViewer({ mediaItems, currentIndex, onClose, onNext, onPrev }: MediaViewerProps) {
  const media = mediaItems[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onNext, onPrev]);

  if (!media) return null;
  const altText = `User uploaded ${media.type}`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in-0"
      onClick={onClose}
    >
      <div 
        className="relative w-full h-full max-w-5xl max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {mediaItems.length > 1 && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-14 w-14 rounded-full text-white hover:bg-white/20 hover:text-white"
            onClick={onPrev}
            aria-label="Previous media"
          >
            <ChevronLeft className="h-10 w-10" />
          </Button>
        )}

        {media.type === 'image' ? (
          <div className="relative w-full h-full">
            <Image
              src={media.src}
              alt={altText}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        ) : (
          <video
            src={media.src}
            controls
            autoPlay
            className="w-full h-full object-contain outline-none"
          >
            Your browser does not support the video tag.
          </video>
        )}

        {mediaItems.length > 1 && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-14 w-14 rounded-full text-white hover:bg-white/20 hover:text-white"
            onClick={onNext}
            aria-label="Next media"
          >
            <ChevronRight className="h-10 w-10" />
          </Button>
        )}
      </div>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-4 right-4 z-10 h-12 w-12 rounded-full text-white hover:bg-white/20 hover:text-white"
        onClick={onClose}
        aria-label="Close media viewer"
      >
        <X className="h-8 w-8" />
      </Button>
    </div>
  );
}
