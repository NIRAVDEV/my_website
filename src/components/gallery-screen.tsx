import { LogOut, ShieldCheck } from 'lucide-react';
import type { Media } from '@/types';
import { Button } from '@/components/ui/button';
import PhotoUploader from './photo-uploader';
import PhotoCard from './photo-card';

type GalleryScreenProps = {
  mediaItems: Media[];
  onLogout: () => void;
  onAddMedia: (media: Media) => void;
  onDeleteMedia: (id: string) => void;
  onUpdateMedia: (id: string, tags: string[]) => void;
};

export default function GalleryScreen({ mediaItems, onLogout, onAddMedia, onDeleteMedia, onUpdateMedia }: GalleryScreenProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Green Vault</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={onLogout} aria-label="Logout">
            <LogOut className="h-5 w-5 text-accent" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <PhotoUploader onAddMedia={onAddMedia} />

        {mediaItems.length === 0 ? (
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-semibold">Your vault is empty</h2>
            <p className="mt-2 text-muted-foreground">
              Upload your first photo or video to start your secure collection.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {mediaItems.map((media) => (
              <PhotoCard 
                key={media.id} 
                media={media} 
                onDelete={onDeleteMedia} 
                onUpdate={onUpdateMedia} 
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
