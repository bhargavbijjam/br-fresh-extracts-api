import cloudinary from '../config/cloudinary.js';

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB (enforced by multer too)

export function uploadImage(req, res, next) {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'file required' });

    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, GIF and WebP are allowed.' });
    }
    if (file.size > MAX_SIZE_BYTES) {
      return res.status(400).json({ error: 'File too large. Maximum size is 5 MB.' });
    }

    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'image' },
      (error, result) => {
        if (error) return next(error);
        return res.json({ url: result.secure_url });
      }
    );

    stream.end(file.buffer);
  } catch (err) {
    next(err);
  }
}
