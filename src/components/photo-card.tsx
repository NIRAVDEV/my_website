"use client";

import Image from 'next/image';
import type { Media } from '@/types';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { MoreVertical, Trash2, Share2 } from 'lucide-react';

type MediaCardProps = {
  media: Media;
  onDelete: (id: string) => void;
  onOpen: () => void;
};

export default function PhotoCard({ media, onDelete, onOpen }: MediaCardProps) {
  const { toast } = useToast();
  const altText = `User uploaded ${media.type}`;

  const handleShare = async () => {
    const fileExtension = media.type === 'image' ? 'png' : 'mp4';
    const fileName = `GreenVault_media_${media.id.substring(0, 8)}.${fileExtension}`;
    
    try {
      const response = await fetch(media.src);
      const blob = await response.blob();
      const file = new File([blob], fileName, { type: blob.type });
  
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Media from Green Vault',
          text: 'Check out this media from my Green Vault!',
          files: [file],
        });
      } else {
        await navigator.clipboard.writeText(media.src);
        toast({
          title: 'Link Copied',
          description: 'A shareable link to the media has been copied to your clipboard.',
        });
      }
    } catch (error) {
      console.error('Sharing/Copying failed:', error);
      toast({
        variant: 'destructive',
        title: 'Action Failed',
        description: 'Could not share or copy the media link.',
      });
    }
  };

  return (
    <>
      <Card className="group overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1 bg-card">
        <CardContent className="p-0 relative">
          <div className="aspect-square relative cursor-pointer" onClick={onOpen}>
              {media.type === 'image' ? (
                <Image
                  src={media.src}
                  alt={altText}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                />
              ) : (
                <video
                  src={media.src}
                  className="object-cover w-full h-full"
                >
                  Your browser does not support the video tag.
                </video>
              )}
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <AlertDialog>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="h-8 w-8 bg-black/50 hover:bg-black/75 border-none">
                            <MoreVertical className="h-4 w-4 text-white" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleShare}>
                            <Share2 className="mr-2 h-4 w-4" />
                            <span>Share</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                    </DropdownMenuContent>
                </DropdownMenu>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        media from this session.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(media.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
