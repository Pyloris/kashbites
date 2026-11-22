import { uploadToMinIO, getFallbackMediaObject, getMinIOStatus } from '../config/minio.js';
import { ApiError } from '../errors/api-error.js';

export class MediaService {
    static async upload({ file, folder = 'reviews' }) {
        if (!file) {
            throw ApiError.badRequest('No image file provided');
        }

        const uploaded = await uploadToMinIO(folder, file.originalname, file.buffer, file.mimetype);
        return uploaded;
    }

    static async uploadMultiple({ files, folder = 'products' }) {
        if (!Array.isArray(files) || files.length === 0) {
            throw ApiError.badRequest('No image files provided for upload');
        }

        const uploadPromises = files.map((file) =>
            uploadToMinIO(folder, file.originalname, file.buffer, file.mimetype)
        );

        const uploadedList = await Promise.all(uploadPromises);
        return uploadedList;
    }

    static getFile({ folder, filename }) {
        const objectKey = `${folder}/${filename}`;
        const item = getFallbackMediaObject(objectKey);
        if (!item) {
            throw ApiError.notFound('Media object not found');
        }
        return item;
    }

    static getStatus() {
        return getMinIOStatus();
    }
}

export default MediaService;
