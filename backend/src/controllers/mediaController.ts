import { Request, Response } from 'express';
import { uploadToMinIO, getFallbackMediaObject, getMinIOStatus } from '../config/minio.js';

export const uploadMediaFile = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const folder = (req.body.folder as 'products' | 'reviews' | 'general') || 'reviews';

    if (!file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const uploaded = await uploadToMinIO(
      folder,
      file.originalname,
      file.buffer,
      file.mimetype
    );

    return res.status(201).json({
      success: true,
      data: uploaded,
    });
  } catch (error: any) {
    console.error('Error uploading to MinIO:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload media to MinIO storage',
    });
  }
};

export const serveMediaFallback = (req: Request, res: Response) => {
  const { folder, filename } = req.params;
  const objectKey = `${folder}/${filename}`;
  const item = getFallbackMediaObject(objectKey);

  if (!item) {
    return res.status(404).json({ success: false, message: 'Media object not found' });
  }

  res.setHeader('Content-Type', item.mimeType);
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  return res.send(item.buffer);
};

export const getMediaStorageStatus = (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: getMinIOStatus(),
  });
};
