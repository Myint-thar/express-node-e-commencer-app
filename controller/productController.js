const Product = require('../models/product');

// READ: Product အားလုံးပြရန်
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({ order: [['createdAt', 'DESC']] });
    res.render('products/index', { products, title: 'Product List' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// READ: Detail တစ်ခုချင်းစီပြရန်
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).send('Product not found');
    res.render('products/show', { product, title: product.name });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// CREATE: Form 
exports.renderCreateForm = (req, res) => {
  res.render('products/create', { title: 'Add New Product' });
};

// CREATE: Product 
exports.createProduct = async (req, res) => {
  try {
    const { name, price, description, stock } = req.body;
    const image = req.file ? req.file.filename : 'default.jpg';
    await Product.create({ name, price, description, stock, image });
    res.redirect('/products');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating product');
  }
};

// UPDATE: Form
exports.renderEditForm = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).send('Product not found');
    res.render('products/edit', { product, title: 'Edit Product' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// UPDATE: Product
exports.updateProduct = async (req, res) => {
  try {
    const { name, price, description, stock } = req.body;
    const updateData = { name, price, description, stock };
    if (req.file) updateData.image = req.file.filename;

    await Product.update(updateData, { where: { id: req.params.id } });
    res.redirect(`/products/${req.params.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating product');
  }
};

// DELETE: Product 
exports.deleteProduct = async (req, res) => {
  try {
    await Product.destroy({ where: { id: req.params.id } });
    res.redirect('/products');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting product');
  }
};