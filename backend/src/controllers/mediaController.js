import { uploadToMinIO, getFallbackMediaObject, getMinIOStatus } from '../config/minio.js';
export const uploadMediaFile = async (req, res) => {
    try {
        const file = req.file;
        const folder = req.body.folder || 'reviews';
        if (!file) {
            return res.status(400).json({ success: false, message: 'No image file provided' });
        }
        const uploaded = await uploadToMinIO(folder, file.originalname, file.buffer, file.mimetype);
        return res.status(201).json({
            success: true,
            data: uploaded,
        });
    }
    catch (error) {
        console.error('Error uploading to MinIO:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to upload media to MinIO storage',
        });
    }
};
export const serveMediaFallback = (req, res) => {
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
export const getMediaStorageStatus = (_req, res) => {
    res.json({
        success: true,
        data: getMinIOStatus(),
    });
};
