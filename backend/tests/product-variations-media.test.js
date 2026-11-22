import test, { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { MediaService } from '../src/services/media.service.js';
import { MediaController } from '../src/controllers/media.controller.js';
import { AdminService } from '../src/services/admin.service.js';
import { AdminController } from '../src/controllers/admin.controller.js';
import { Product } from '../src/database/models/products.model.js';

describe('Product Multiple Pictures & Variations Management Suite', () => {
    let createdProductId = null;

    before(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect('mongodb://localhost:27017/kashbites').catch(() => {});
        }
    });

    after(async () => {
        if (createdProductId) {
            await AdminService.deleteProduct({ id: createdProductId }).catch(() => {});
            if (mongoose.connection.readyState === 1) {
                await Product.findOneAndDelete({ _id: createdProductId }).catch(() => {});
            }
        }
        await mongoose.disconnect().catch(() => {});
    });

    it('1. MediaService.uploadMultiple accepts an array of files and uploads each', async () => {
        const mockFiles = [
            {
                originalname: 'walnut-front.jpg',
                buffer: Buffer.from('mock-binary-data-1'),
                mimetype: 'image/jpeg',
            },
            {
                originalname: 'walnut-opened.png',
                buffer: Buffer.from('mock-binary-data-2'),
                mimetype: 'image/png',
            },
            {
                originalname: 'walnut-nutrition.jpg',
                buffer: Buffer.from('mock-binary-data-3'),
                mimetype: 'image/jpeg',
            },
        ];

        const uploaded = await MediaService.uploadMultiple({
            files: mockFiles,
            folder: 'products',
        });

        assert.ok(Array.isArray(uploaded), 'Should return an array of upload results');
        assert.strictEqual(uploaded.length, 3, 'Should have 3 uploaded items');
        uploaded.forEach((item) => {
            assert.ok(item.url, 'Each item must have a url');
            assert.ok(item.objectKey, 'Each item must have an objectKey');
            assert.ok(item.storage, 'Each item must have storage descriptor');
        });
    });

    it('2. MediaController.uploadMultipleMediaFiles returns 201 response with uploaded file URLs', async () => {
        const req = {
            files: [
                {
                    originalname: 'almond-macro.jpg',
                    buffer: Buffer.from('macro-image-buffer'),
                    mimetype: 'image/jpeg',
                },
                {
                    originalname: 'almond-box.jpg',
                    buffer: Buffer.from('box-image-buffer'),
                    mimetype: 'image/jpeg',
                },
            ],
            body: { folder: 'products' },
        };

        let responseCode = null;
        let responseData = null;
        const res = {
            status(code) {
                responseCode = code;
                return this;
            },
            json(data) {
                responseData = data;
                return this;
            },
        };

        await MediaController.uploadMultipleMediaFiles(req, res);

        assert.strictEqual(responseCode, 201);
        assert.strictEqual(responseData.status, 1);
        assert.ok(Array.isArray(responseData.data));
        assert.strictEqual(responseData.data.length, 2);
        assert.ok(responseData.data[0].url);
        assert.ok(responseData.data[1].url);
    });

    it('3. AdminService.createProduct stores multiple pictures and custom variations', async () => {
        const payload = {
            name: 'Pampore Golden Saffron Reserve',
            category: 'saffron',
            subtitle: 'Grade A1 Mongra Saffron Filaments',
            description: 'Sun-dried organic crimson strands from Pampore plateau.',
            origin: 'Pampore Plateau, Kashmir',
            images: [
                '/media/saffron-box.jpg',
                '/media/saffron-strands.jpg',
                '/media/saffron-lab-test.jpg',
            ],
            primaryImage: '/media/saffron-box.jpg',
            netWeights: [
                { weight: '1g', price: 449, originalPrice: 599, inStock: true, stockQuantity: 100 },
                { weight: '2g', price: 849, originalPrice: 1149, inStock: true, stockQuantity: 80 },
                { weight: '5g', price: 1999, originalPrice: 2699, inStock: true, stockQuantity: 40 },
            ],
            stockQuantity: 220,
        };

        const created = await AdminService.createProduct(payload);
        createdProductId = created._id;

        assert.ok(created);
        assert.strictEqual(created.name, 'Pampore Golden Saffron Reserve');
        assert.strictEqual(created.images.length, 3, 'Product should have 3 images');
        assert.strictEqual(created.primaryImage, '/media/saffron-box.jpg');
        assert.strictEqual(created.netWeights.length, 3, 'Product should have 3 variations');
        assert.strictEqual(created.netWeights[0].weight, '1g');
        assert.strictEqual(created.netWeights[0].price, 449);
        assert.strictEqual(created.netWeights[1].weight, '2g');
        assert.strictEqual(created.netWeights[2].weight, '5g');
    });

    it('4. AdminService.updateProduct allows adding, editing, and removing variations', async () => {
        assert.ok(createdProductId, 'Test product must exist');

        // Update with 4 variations (adding a 10g tier and updating 1g price)
        const updatedWithMoreVariations = await AdminService.updateProduct({
            id: createdProductId,
            updates: {
                netWeights: [
                    { weight: '1g', price: 499, originalPrice: 649, inStock: true, stockQuantity: 95 },
                    { weight: '2g', price: 849, originalPrice: 1149, inStock: true, stockQuantity: 80 },
                    { weight: '5g', price: 1999, originalPrice: 2699, inStock: true, stockQuantity: 40 },
                    { weight: '10g (Festive Gift Pack)', price: 3799, originalPrice: 4999, inStock: true, stockQuantity: 20 },
                ],
            },
        });

        assert.strictEqual(updatedWithMoreVariations.netWeights.length, 4, 'Should now have 4 variations');
        assert.strictEqual(updatedWithMoreVariations.netWeights[3].weight, '10g (Festive Gift Pack)');
        assert.strictEqual(updatedWithMoreVariations.netWeights[3].price, 3799);

        // Now remove 2 variations (leaving only 1g and 5g)
        const updatedWithFewerVariations = await AdminService.updateProduct({
            id: createdProductId,
            updates: {
                netWeights: [
                    { weight: '1g', price: 499, originalPrice: 649, inStock: true, stockQuantity: 95 },
                    { weight: '5g', price: 1999, originalPrice: 2699, inStock: true, stockQuantity: 40 },
                ],
            },
        });

        assert.strictEqual(updatedWithFewerVariations.netWeights.length, 2, 'Should now have 2 variations');
        assert.strictEqual(updatedWithFewerVariations.netWeights[0].weight, '1g');
        assert.strictEqual(updatedWithFewerVariations.netWeights[1].weight, '5g');
    });

    it('5. AdminService.updateProduct allows adding and removing pictures', async () => {
        assert.ok(createdProductId, 'Test product must exist');

        // Update images array (add 4th picture, change primary)
        const updatedImages = await AdminService.updateProduct({
            id: createdProductId,
            updates: {
                images: [
                    '/media/saffron-strands.jpg',
                    '/media/saffron-macro-zoom.jpg',
                ],
                primaryImage: '/media/saffron-strands.jpg',
            },
        });

        assert.strictEqual(updatedImages.images.length, 2, 'Should have 2 pictures');
        assert.strictEqual(updatedImages.primaryImage, '/media/saffron-strands.jpg');
        assert.strictEqual(updatedImages.images[1], '/media/saffron-macro-zoom.jpg');
    });

    it('6. AdminService.getProducts ensures every product has valid _id and id fields', async () => {
        const prods = await AdminService.getProducts();
        assert.ok(Array.isArray(prods) && prods.length > 0, 'Products list should not be empty');
        prods.forEach((p) => {
            assert.ok(p._id, `Product "${p.name}" must have _id`);
            assert.strictEqual(typeof p._id, 'string');
            assert.ok(p.id, `Product "${p.name}" must have id`);
        });
    });

    it('7. AdminService.deleteProduct successfully removes a product by ObjectId', async () => {
        assert.ok(createdProductId, 'Test product must exist');
        const deleteResult = await AdminService.deleteProduct({ id: createdProductId });
        assert.strictEqual(deleteResult.deleted, true);
        assert.strictEqual(deleteResult.id, createdProductId);

        // Verify it is gone from getProducts
        const prods = await AdminService.getProducts();
        const found = prods.find((p) => String(p._id) === createdProductId);
        assert.strictEqual(found, undefined, 'Deleted product should no longer be present');

        // Prevent double delete in after hook
        createdProductId = null;
    });

    it('8. AdminService.deleteProduct successfully deletes a product by slug without CastError', async () => {
        // Create a temporary product
        const tempProduct = await AdminService.createProduct({
            name: 'Temp Kashmiri Honey Pouch',
            category: 'combos',
            price: 599,
            netWeights: [{ weight: '500g', price: 599, inStock: true }],
        });

        assert.ok(tempProduct);
        assert.ok(tempProduct.slug);

        // Delete by generated slug string (non-ObjectId)
        const deleteResult = await AdminService.deleteProduct({ id: tempProduct.slug });
        assert.strictEqual(deleteResult.deleted, true);
        assert.strictEqual(deleteResult.id, tempProduct.slug);
    });

    it('9. AdminController.adminDeleteProduct returns HTTP 200 ApiResponse', async () => {
        const temp = await AdminService.createProduct({
            name: 'Controller Delete Test',
            slug: 'controller-delete-test',
            category: 'walnuts',
            price: 299,
            netWeights: [{ weight: '250g', price: 299, inStock: true }],
        });

        const req = { params: { id: temp._id } };
        let responseCode = null;
        let responseData = null;
        const res = {
            status(code) {
                responseCode = code;
                return this;
            },
            json(data) {
                responseData = data;
                return this;
            },
        };

        await AdminController.adminDeleteProduct(req, res);
        assert.strictEqual(responseCode, 200);
        assert.strictEqual(responseData.status, 1);
        assert.strictEqual(responseData.success, true);
        assert.strictEqual(responseData.data.deleted, true);
    });
});
