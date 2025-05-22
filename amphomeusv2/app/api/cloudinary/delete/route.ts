import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import type { CloudinaryError, CloudinaryUploadResult } from '@/types/cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: NextRequest) {
  try {
    const { publicId } = await request.json();
    
    if (!publicId) {
      return NextResponse.json(
        { error: 'No public ID provided' },
        { status: 400 }
      );
    }
    
    // Delete from Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        publicId,
        (error: CloudinaryError | undefined, cloudinaryResult: CloudinaryUploadResult | undefined) => {
          if (error) {
            console.error(`[Cloudinary DELETE /api/cloudinary/delete] Cloudinary destroy error for publicId ${publicId}:`, error); // Log error
            return reject(error);
          }
          console.log(`[Cloudinary DELETE /api/cloudinary/delete] Cloudinary destroy success for publicId ${publicId}:`, cloudinaryResult); // Log success result
          resolve(cloudinaryResult);
        }
      );
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return NextResponse.json(
      { error: 'Failed to delete from Cloudinary' },
      { status: 500 }
    );
  }
}
