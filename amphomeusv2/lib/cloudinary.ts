// Helper to construct absolute URLs for API calls from server-side
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  // For Vercel deployments, VERCEL_URL contains the domain (might need https prefix)
  // NEXT_PUBLIC_VERCEL_URL is often the full URL for the deployment
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return process.env.NEXT_PUBLIC_VERCEL_URL;
  }
  if (process.env.VERCEL_URL) {
    // VERCEL_URL is just the domain, ensure it has a protocol
    return `https://${process.env.VERCEL_URL}`;
  }
  // Fallback for local development
  return `http://localhost:${process.env.PORT || 3000}`;
};

const absoluteApiRoute = (path: string) => {
  // Ensures path starts with a slash if it doesn't
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getBaseUrl()}${normalizedPath}`;
};

/**
 * Cloudinary upload response type
 */
export type CloudinaryUploadResponse = {
  asset_id: string;
  public_id: string;
  version: number;
  version_id: string;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  url: string;
  secure_url: string;
  folder: string;
  original_filename: string;
};

/**
 * Cloudinary delete response type
 */
export type CloudinaryDeleteResponse = {
  result: string;
};

/**
 * Uploads a file to Cloudinary
 * @param file The file to upload
 * @returns The Cloudinary response
 */
export async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    // Use our backend API route instead of direct Cloudinary upload
    const response = await fetch(absoluteApiRoute('/api/cloudinary/upload'), {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to upload to Cloudinary');
    }

    return await response.json();
  } catch (error: unknown) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

/**
 * Deletes a file from Cloudinary
 * @param publicId The public ID of the file to delete
 * @returns The Cloudinary response
 */
export async function deleteFromCloudinary(publicId: string): Promise<CloudinaryDeleteResponse> {
  try {
    // Use our backend API route for deletion
    const response = await fetch(absoluteApiRoute('/api/cloudinary/delete'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to delete from Cloudinary');
    }

    return await response.json();
  } catch (error: unknown) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
}
