/**
 * @swagger
 * tags:
 *   name: Media
 *   description: MinIO object storage uploads and media fallbacks
 */

/**
 * @swagger
 * /media/status:
 *   get:
 *     summary: Get MinIO storage connection status
 *     tags: [Media]
 *     responses:
 *       200:
 *         description: MinIO connection details
 *
 * /media/upload:
 *   post:
 *     summary: Upload an image file to MinIO bucket
 *     tags: [Media]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         description: Image to upload
 *       - in: formData
 *         name: folder
 *         type: string
 *         description: Target bucket folder (e.g. products, reviews)
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: No file provided
 *
 * /media/file/{folder}/{filename}:
 *   get:
 *     summary: Fallback streaming endpoint for media files
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: folder
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Media file binary
 *       404:
 *         description: Media object not found
 */

export default {};
