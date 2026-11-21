import { catchError } from '../errors/catch-error.js';
import { ApiResponse } from '../utils/api-response.js';
import { MediaService } from '../services/media.service.js';

export class MediaController {
    static uploadMediaFile = catchError(async (req, res) => {
        const file = req.file;
        const folder = req.body.folder || 'reviews';
        const uploaded = await MediaService.upload({ file, folder });
        return ApiResponse.created(res, uploaded, 'Media uploaded successfully');
    });

    static serveMediaFallback = catchError(async (req, res) => {
        const { folder, filename } = req.params;
        const item = MediaService.getFile({ folder, filename });
        res.setHeader('Content-Type', item.mimeType);
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        return res.send(item.buffer);
    });

    static getMediaStorageStatus = catchError(async (_req, res) => {
        const status = MediaService.getStatus();
        return ApiResponse.success(res, status, 'Media storage status retrieved');
    });
}

// Named exports for backward compatibility
export const uploadMediaFile = MediaController.uploadMediaFile;
export const serveMediaFallback = MediaController.serveMediaFallback;
export const getMediaStorageStatus = MediaController.getMediaStorageStatus;

export default MediaController;
