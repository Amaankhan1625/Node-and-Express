const express = require('express');
const router = express.Router();
const {Product}= require("../model/product");
const {Category}= require("../model/category");
const mongoose = require("mongoose");

//GET ALL
router.get('/',async (req,res)=>{
    let filter = {};
    if(req.query.categories){
        filter = { category: { $in: req.query.categories.split(',').map(id => id.trim()) } };
    }
    const productList = await Product.find(filter).select('name images').populate('category');

    if(!productList){
        res.status(500).json({success:false})
    }

    res.send(productList);
})
//GET FEATURED
router.get(`/getfeatured/:count`, async (req, res) => {
    const count = req.params.count ? parseInt(req.params.count) : 0;
    try {
        const featuredProducts = await Product.find({ isFeatured: true }).limit(+count);
        res.send(featuredProducts);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

//GET COUNT
router.get('/getcount', async (req, res) => {
    try {
        const productCount = await Product.countDocuments();

        res.send({ count: productCount });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

//Get product by ID
router.get('/:id',async (req,res)=>{
    const product = await Product.findById(req.params.id).populate('category');

    if(!product){
        res.status(500).json({success:false})
    }

    res.send(product);
})

//POST
router.post('/',async (req,res)=>{

    // Validate category ID format
    if(!req.body.category){
        return res.status(400).json({success:false, message:"Category ID is required"});
    }

    // Check if it's a valid MongoDB ObjectId format
    if(!req.body.category.match(/^[0-9a-fA-F]{24}$/)){
        return res.status(400).json({success:false, message:`Invalid Category ID format. Expected 24 character hex string, got "${req.body.category}"`});
    }

    try {
        const category = await Category.findById(req.body.category);
        if(!category) return res.status(400).json({success:false, message:"Category not found in database"});

        let product = new Product({
            name:req.body.name,
            description:req.body.description,
            richdescription:req.body.richdescription,
            image:req.body.image,
            brand:req.body.brand,
            Instock:req.body.Instock,
            price:req.body.price,
            category:req.body.category,
            numReviews:req.body.numReviews,
            rating:req.body.rating,
            isFeatured:req.body.isFeatured,
            dateCreated:req.body.dateCreated
    })

        product = await product.save()
        if(!product){
            return res.status(500).json({success:false, message:"The product cannot be created"});
        }
        res.status(201).json({success:true, data:product});
    } catch(error) {
        console.log('Error creating product:', error);
        return res.status(500).json({success:false, message:error.message});
    }
})

//UPDATE
router.put('/:id',async (req,res)=>{
    //product validation
   mongoose.isValidObjectId(req.params.id) || res.status(400).json({success:false, message:"Invalid product ID format"});


 //category validation
        if(!req.body.category){
            return res.status(400).json({success:false, message:"Category ID is required"});
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name:req.body.name,
            description:req.body.description,
            richdescription:req.body.richdescription,
            image:req.body.image,
            brand:req.body.brand,
            Instock:req.body.Instock,
            price:req.body.price,
            category:req.body.category,
            numReviews:req.body.numReviews,
            rating:req.body.rating,
            isFeatured:req.body.isFeatured,
            dateCreated:req.body.dateCreated
            },
            {new:true}
        )

        if(!product){
            return res.status(500).json({success:false, message:"The product cannot be updated"});
        }

        res.status(200).json({success:true, data:product});
})

//DELETE
router.delete('/:id',async (req,res)=>{
    const product = await Product.findByIdAndDelete(req.params.id).then(product=>{
        mongoose.isValidObjectId(req.params.id) || res.status(400).json({success:false, message:"Invalid product ID format"});

        if(product){
            return res.status(200).json({success:true, message:"The product is deleted"});
        }
    })
    .catch(err=>{
        return res.status(500).json({success:false, message:err}); 
    })
})


module.exports = router;