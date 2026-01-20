import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload an image to Cloudinary
 * @param file - File path, URL, or Buffer to upload
 * @param folder - Optional folder name in Cloudinary
 * @returns Upload result with URL and public_id
 */
export async function uploadImage(file: string | Buffer, folder: string = 'chulbuli-jewels') {
  try {
    // Convert Buffer to base64 data URI if needed
    const fileToUpload = Buffer.isBuffer(file)
      ? `data:image/jpeg;base64,${file.toString('base64')}`
      : file;

    const uploadResult = await cloudinary.uploader.upload(fileToUpload, {
      folder,
      resource_type: 'auto',
    });

    return {
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Delete an image from Cloudinary
 * @param publicId - The public ID of the image to delete
 */
export async function deleteImage(publicId: string) {
  try {
    await cloudinary.uploader.destroy(publicId);
    return { success: true };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
}

/**
 * Get optimized image URL
 * @param publicId - The public ID of the image
 * @param width - Optional width
 * @param height - Optional height
 */
export function getOptimizedImageUrl(
  publicId: string,
  width?: number,
  height?: number
) {
  return cloudinary.url(publicId, {
    fetch_format: 'auto',
    quality: 'auto',
    width,
    height,
    crop: width && height ? 'fill' : undefined,
  });
}

export default cloudinary;
