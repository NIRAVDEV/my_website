import { Loader2, Share2, Info } from 'lucide-react';
import type { Media } from '@/types';
import PhotoUploader from './photo-uploader';
import PhotoCard from './photo-card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from './ui/button';

type GalleryScreenProps = {
  mediaItems: Media[];
  onAddMedia: (media: Media) => void;
  onDeleteMedia: (id: string) => void;
  onOpenMedia: (index: number) => void;
  isLoading: boolean;
};

export default function GalleryScreen({ mediaItems, onAddMedia, onDeleteMedia, onOpenMedia, isLoading }: GalleryScreenProps) {
  return (
    <div className="bg-background text-foreground">
      <header className="bg-background/80 backdrop-blur-sm sticky top-[56px] z-40 border-b">
        <div className="container mx-auto flex h-24 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div>
                <h1 className="text-4xl font-bold text-foreground">Green Vault</h1>
                <p className="text-muted-foreground">Your private space for photos and videos.</p>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <Share2 className="mr-2 h-4 w-4" />
                Share Gallery
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  How to Share Your Gallery
                </AlertDialogTitle>
                <AlertDialogDescription>
                  <div className="space-y-4 text-sm text-muted-foreground">
                    <p className="pt-2">
                      Your gallery is private and accessible only when you are logged in. To share your entire vault with a trusted person, they will need to log in with the same account credentials.
                    </p>
                    <p>
                      To share individual photos or videos, use the menu on each item in the gallery. This provides a secure way to share specific media without granting full access.
                    </p>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction>Got it!</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 pt-4">
        <PhotoUploader onAddMedia={onAddMedia} />

        {isLoading ? (
          <div className="mt-16 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="ml-4 text-muted-foreground">Loading your vault...</p>
          </div>
        ) : mediaItems.length === 0 ? (
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-semibold">Your vault is empty</h2>
            <p className="mt-2 text-muted-foreground">
              Upload your first photo or video to start your secure collection.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {mediaItems.map((media, index) => (
              <PhotoCard 
                key={media.id} 
                media={media} 
                onDelete={onDeleteMedia} 
                onOpen={() => onOpenMedia(index)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
