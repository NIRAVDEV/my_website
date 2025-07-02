import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type { Media } from '@/types';

const uploadsDir = path.join(process.cwd(), 'public/uploads');

// Ensure the upload directory exists
async function ensureUploadsDirExists() {
    try {
        await fs.access(uploadsDir);
    } catch (error) {
        await fs.mkdir(uploadsDir, { recursive: true });
    }
}

export async function POST(request: Request) {
    await ensureUploadsDirExists();
    try {
        const { mediaDataUri, fileName, type } = await request.json();

        if (!mediaDataUri || !fileName || !type) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }
        
        // Prevent path traversal and create a unique name
        const safeFileName = path.basename(fileName);
        const uniqueFileName = `${Date.now()}-${safeFileName}`;
        const filePath = path.join(uploadsDir, uniqueFileName);
        
        // Decode the base64 data URI
        const base64Data = mediaDataUri.split(';base64,').pop();
        if (!base64Data) {
            return NextResponse.json({ message: 'Invalid data URI' }, { status: 400 });
        }
        
        const buffer = Buffer.from(base64Data, 'base64');
        
        await fs.writeFile(filePath, buffer);

        const newMedia: Media = {
            id: uniqueFileName,
            src: `/uploads/${uniqueFileName}`,
            type: type,
        };

        return NextResponse.json({ success: true, media: newMedia });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Upload failed:', errorMessage);
        return NextResponse.json({ message: 'Upload failed', error: errorMessage }, { status: 500 });
    }
}
