import { Router } from 'express';
import multer from 'multer';
import { uploadMediaFile, serveMediaFallback, getMediaStorageStatus, } from '../controllers/mediaController.js';
const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max per image
    },
});
router.get('/media/status', getMediaStorageStatus);
router.post('/media/upload', upload.single('file'), uploadMediaFile);
router.get('/media/file/:folder/:filename', serveMediaFallback);
export default router;
