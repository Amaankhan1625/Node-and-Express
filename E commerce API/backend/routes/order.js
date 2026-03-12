const express = require('express');
const router = express.Router();
const {Order}= require("../model/order");


router.get('/',(req,res)=>{
    res.send("ORDER API");
})

router.get('/',async (req,res)=>{
    const orderList = await Order.find();

    if(!orderList){
        res.status(500).json({success:false})
    }

    res.send(orderList);
})

router.post('/',(req,res)=>{
    const order = new Order({
        name:req.body.name,
        image:req.body.image,
        Instock:req.body.Instock
    })

    order.save().then((createdOrder)=>{
        res.status(201).json(createdOrder);
    })
    .catch((err)=>{
        res.status(500).json({
            error:err,
            success:false
        })
    })
})

module.exports = router;