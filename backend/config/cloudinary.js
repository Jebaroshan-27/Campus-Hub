const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Check if Cloudinary credentials are configured with real values
 */
const isCloudinaryConfigured = () => {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;

  return !!(
    name &&
    key &&
    secret &&
    !name.includes('your_') &&
    !key.includes('your_') &&
    !secret.includes('your_') &&
    name !== 'campushub_demo'
  );
};

/**
 * Upload file buffer directly to Cloudinary using upload_stream
 * @param {Buffer} buffer - File buffer from Multer
 * @param {string} originalName - Original filename
 * @param {string} mimeType - File mimetype
 * @returns {Promise<{ secure_url: string, public_id: string, resource_type: string }>}
 */
const uploadToCloudinary = (buffer, originalName, mimeType) => {
  return new Promise((resolve, reject) => {
    // If real Cloudinary credentials are provided, perform live upload
    if (isCloudinaryConfigured()) {
      const sanitizedName = originalName
        ? originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_')
        : 'file';
      const publicId = `${Date.now()}_${sanitizedName}`;

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'campushub_notes',
          resource_type: 'auto', // Automatically handles PDF, DOCX, images, etc.
          public_id: publicId,
        },
        (error, result) => {
          if (error) {
            console.error('[Cloudinary Upload Error]:', error);
            return reject(new Error(`Cloudinary upload failed: ${error.message}`));
          }
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            resource_type: result.resource_type,
          });
        }
      );

      const readableStream = Readable.from(buffer);
      readableStream.pipe(uploadStream);
    } else {
      // Development fallback when Cloudinary credentials are not yet configured in .env
      console.warn(
        '[CampusHub Cloudinary]: Live credentials not configured in backend/.env. Using simulated Cloudinary file record for development.'
      );
      const sanitizedName = originalName
        ? originalName.replace(/[^a-zA-Z0-9._-]/g, '_')
        : 'study_material.pdf';
      const mockPublicId = `campushub_notes/${Date.now()}_${sanitizedName}`;
      const mockUrl = `https://res.cloudinary.com/campushub-dev/image/upload/v1/${mockPublicId}`;

      resolve({
        secure_url: mockUrl,
        public_id: mockPublicId,
        resource_type: mimeType && mimeType.startsWith('image/') ? 'image' : 'raw',
      });
    }
  });
};

/**
 * Delete a file from Cloudinary by its public ID
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - 'image', 'raw', or 'auto'
 */
const deleteFromCloudinary = async (publicId, resourceType = 'raw') => {
  if (!publicId) return;

  if (isCloudinaryConfigured()) {
    try {
      // First try deleting with the provided or raw resource type
      const res = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
        invalidate: true,
      });

      // If not found as raw, try as image (for images/PDFs uploaded as image)
      if (res.result === 'not found' && resourceType !== 'image') {
        await cloudinary.uploader.destroy(publicId, {
          resource_type: 'image',
          invalidate: true,
        });
      }
    } catch (err) {
      console.warn(`[Cloudinary Destroy Warning]: Could not delete file ${publicId}:`, err.message);
      // We don't throw an error here to prevent MongoDB delete from failing if file was already removed
    }
  } else {
    console.log(`[Cloudinary Mock]: Deleted simulated file with ID: ${publicId}`);
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  isCloudinaryConfigured,
};
