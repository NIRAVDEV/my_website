import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type { Media } from '@/types';
import { stat } from 'fs/promises';

const uploadsDir = path.join(process.cwd(), 'public/uploads');

function getMediaType(fileName: string): 'image' | 'video' {
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.flv'];
    const ext = path.extname(fileName).toLowerCase();

    if (videoExtensions.includes(ext)) {
        return 'video';
    }
    // Default to image for any other extension, as this is primarily a photo/video vault
    return 'image';
}

// Ensure the upload directory exists
async function ensureUploadsDirExists() {
    try {
        await fs.access(uploadsDir);
    } catch (error) {
        // If it doesn't exist, create it
        await fs.mkdir(uploadsDir, { recursive: true });
    }
}

export async function GET() {
    await ensureUploadsDirExists();
    try {
        const fileNames = await fs.readdir(uploadsDir);
        
        const mediaItemsWithStats = await Promise.all(
            fileNames.map(async (name) => {
                const filePath = path.join(uploadsDir, name);
                const stats = await stat(filePath);
                return {
                    id: name,
                    src: `/uploads/${name}`,
                    type: getMediaType(name),
                    createdAt: stats.mtime.getTime(),
                };
            })
        );

        // Sort by creation time, newest first
        mediaItemsWithStats.sort((a, b) => b.createdAt - a.createdAt);
        
        // Remove createdAt before sending to client
        const mediaItems: Media[] = mediaItemsWithStats.map(({ id, src, type }) => ({ id, src, type }));

        return NextResponse.json(mediaItems);
    } catch (error) {
        console.error('Failed to read media files:', error);
        // If the directory doesn't exist yet, return an empty array
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            return NextResponse.json([]);
        }
        return NextResponse.json({ message: 'Error fetching media' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    await ensureUploadsDirExists();
    try {
        const { fileName } = await request.json();
        if (!fileName || typeof fileName !== 'string') {
            return NextResponse.json({ message: 'File name is required' }, { status: 400 });
        }

        // Basic security check to prevent path traversal
        if (fileName.includes('..') || fileName.includes('/')) {
             return NextResponse.json({ message: 'Invalid file name' }, { status: 400 });
        }

        const filePath = path.join(uploadsDir, fileName);

        await fs.unlink(filePath);

        return NextResponse.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Failed to delete file:', error);
        // If file doesn't exist, it might have been deleted already.
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            return NextResponse.json({ message: 'File not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Error deleting file' }, { status: 500 });
    }
}
