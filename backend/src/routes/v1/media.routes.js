import { Router } from 'express';
import multer from 'multer';
import { MediaController } from '../../controllers/media.controller.js';

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
});

router.get('/status', MediaController.getMediaStorageStatus);
router.post('/upload', upload.single('file'), MediaController.uploadMediaFile);
router.post('/upload-multiple', upload.array('files', 10), MediaController.uploadMultipleMediaFiles);
router.get('/file/:folder/:filename', MediaController.serveMediaFallback);

export default router;
