import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const cloudinaryService = {
  // Upload file to Cloudinary
  uploadFile: async (fileBuffer: Buffer, originalName: string, fileType: string) => {
    try {
      const result = await cloudinary.uploader.upload(
        `data:${fileType === 'pdf' ? 'application/pdf' : 'image/jpeg'};base64,${fileBuffer.toString('base64')}`,
        {
          folder: 'medical-reports',
          public_id: `${Date.now()}-${originalName.split('.')[0]}`,
          resource_type: fileType === 'pdf' ? 'raw' : 'image',
          format: fileType === 'pdf' ? 'pdf' : 'jpg'
        }
      );

      return {
        url: result.secure_url,
        publicId: result.public_id,
        originalName
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload file to Cloudinary');
    }
  },

  // Delete file from Cloudinary
  deleteFile: async (publicId: string, resourceType: string = 'image') => {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      });
      return result;
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new Error('Failed to delete file from Cloudinary');
    }
  },

  // Get file as base64 for Gemini processing
  getFileAsBase64: async (publicId: string, resourceType: string = 'image') => {
    try {
      const result = await cloudinary.api.resource(publicId, {
        resource_type: resourceType
      });
      
      const response = await fetch(result.secure_url);
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      
      return base64;
    } catch (error) {
      console.error('Error getting file as base64:', error);
      throw new Error('Failed to fetch file from Cloudinary');
    }
  }
};