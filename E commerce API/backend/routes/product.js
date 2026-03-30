const express = require('express');
const router = express.Router();
exports.router = router;
const productService = require('../services/productService');


//GET ALL
router.get('/',async (req,res)=>{
    try {
        const productList = await productService.getProducts(req.query);
        res.send(productList);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
})
//GET FEATURED
router.get(`/getfeatured/:count`, async (req, res) => {
    try {
        const featuredProducts = await productService.getFeaturedProducts(req.params.count);
        res.send(featuredProducts);
    } catch (error) {
        const statusCode = error.message === 'Invalid count value' ? 400 : 500;
        res.status(statusCode).json({ success: false, message: error.message });
    }
});

//GET COUNT
router.get('/getcount', async (req, res) => {
    try {
        const productCount = await productService.getProductCount();

        res.send({ count: productCount });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

//Get product by ID
router.get('/:id',async (req,res)=>{
    try {
        const product = await productService.getProductById(req.params.id);
        res.send(product);
    } catch (error) {
        const statusCode = error.message === 'Invalid product ID' ? 400 : error.message === 'Product not found' ? 404 : 500;
        res.status(statusCode).json({ success: false, message: error.message });
    }
})

//POST
router.post('/',async (req,res)=>{
    try {
        const product = await productService.createProduct(req.body, req.file, {
            protocol: req.protocol,
            host: req.get('host')
        });

        res.status(201).json({ success: true, data: product });
    } catch(error) {
        const statusCode = ['Category ID is required', 'Invalid category ID'].includes(error.message)
            ? 400
            : error.message === 'Category not found'
                ? 404
                : 500;

        return res.status(statusCode).json({ success: false, message: error.message });
    }
})

//UPDATE
router.put('/:id',async (req,res)=>{
    try {
        const product = await productService.updateProduct(req.params.id, req.body);

        res.status(200).json({ success: true, data: product });
    } catch (error) {
        const statusCode = ['Category ID is required', 'Invalid product ID', 'Invalid category ID'].includes(error.message)
            ? 400
            : error.message === 'Category not found' || error.message === 'Product not found'
                ? 404
                : 500;

        res.status(statusCode).json({ success: false, message: error.message });
    }
})

//DELETE
router.delete('/:id',async (req,res)=>{
    try {
        await productService.deleteProduct(req.params.id);
        return res.status(200).json({ success: true, message: 'The product is deleted' });
    } catch (error) {
        const statusCode = error.message === 'Invalid product ID'
            ? 400
            : error.message === 'Product not found'
                ? 404
                : 500;

        return res.status(statusCode).json({ success: false, message: error.message });
    }
})


module.exports = router;