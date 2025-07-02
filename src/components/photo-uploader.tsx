"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2 } from 'lucide-react';
import type { Media } from '@/types';

type PhotoUploaderProps = {
  onAddMedia: (media: Media) => void;
};

export default function PhotoUploader({ onAddMedia }: PhotoUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast({
            variant: 'destructive',
            title: 'Invalid File Type',
            description: 'Please upload an image or video file.',
        });
        return;
    }

    setIsLoading(true);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const mediaDataUri = reader.result as string;
      try {
        const newMedia: Media = {
          id: new Date().toISOString() + Math.random(),
          src: mediaDataUri,
          type: file.type.startsWith('image/') ? 'image' : 'video',
        };
        onAddMedia(newMedia);
        toast({
          title: 'Upload Successful',
          description: 'Your media has been added to the vault.',
        });
      } catch (error) {
        console.error('Upload failed:', error);
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: 'The media could not be added.',
        });
      } finally {
        setIsLoading(false);
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
      }
    };
    reader.onerror = () => {
        toast({
            variant: 'destructive',
            title: 'File Read Error',
            description: 'Could not read the selected file.',
        });
        setIsLoading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  }

  return (
    <div className="rounded-lg border-2 border-dashed border-border p-4 text-center transition-colors hover:border-accent/80 bg-card/50 md:p-8">
      <Input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,video/*"
        disabled={isLoading}
      />
      <Button onClick={handleClick} disabled={isLoading} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-5 w-5" />
            Upload Media
          </>
        )}
      </Button>
      <p className="mt-4 text-sm text-muted-foreground">
        Your photos and videos are uploaded to this session only. They will be gone on refresh.
      </p>
    </div>
  );
}
