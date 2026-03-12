const express = require('express');
const router = express.Router();
const {Customer}= require("../model/customer");


router.get('/',(req,res)=>{
    res.send("CUSTOMER API");
})

router.get('/',async (req,res)=>{
    const customerList = await Customer.find();

    if(!customerList){
        res.status(500).json({success:false})
    }

    res.send(customerList);
})

router.post('/',(req,res)=>{
    const customer = new Customer({
        name:req.body.name,
        email:req.body.email,
        phone:req.body.phone
    })

    product.save().then((createdProduct)=>{
        res.status(201).json(createdProduct);
    })
    .catch((err)=>{
        res.status(500).json({
            error:err,
            success:false
        })
    })
})

module.exports = router;