const express = require('express');
const router = express.Router();
const productController = require('../controller/productController');
const upload = require('../middleware/uplodemiddleware');

router.get('/', productController.getAllProducts);
router.get('/create', productController.renderCreateForm);
router.post('/', upload.single('image'), productController.createProduct);
router.get('/:id', productController.getProductById);
router.get('/:id/edit', productController.renderEditForm);
router.post('/:id/update', upload.single('image'), productController.updateProduct);
router.post('/:id/delete', productController.deleteProduct);

module.exports = router;