import Image from 'next/image';
import type { Photo } from '@/types';
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';

type PhotoCardProps = {
  photo: Photo;
};

export default function PhotoCard({ photo }: PhotoCardProps) {
  const altText = photo.tags.length > 0 ? `Photo of ${photo.tags.join(', ')}` : "User uploaded content";

  return (
    <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1 bg-card">
      <CardContent className="p-0">
        <div className="aspect-square relative">
            <Image
              src={photo.src}
              alt={altText}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
        </div>
      </CardContent>
      {photo.tags.length > 0 && (
        <CardFooter className="p-3 bg-card/50">
          <div className="flex flex-wrap gap-1">
            {photo.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-primary/20 text-primary-foreground/90 border-0 font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
