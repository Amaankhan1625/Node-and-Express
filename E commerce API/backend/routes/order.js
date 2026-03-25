const express = require('express')
const router = express.Router();
const {Order}= require("../model/order");
const {OrderItem}= require("../model/orderItem");
const mongoose = require("mongoose");


router.get('/', async (req, res) => {
    const orderList = await Order.find()
        .populate('customer', 'name')
        .populate({
            path: 'orderItem',
            populate: {
                path: 'product',
                model: 'Product'
            }
        });

    if (!orderList) {
        return res.status(500).json({ success: false });
    }

    res.send(orderList);
});

router.get('/:id',async (req,res)=>{
    const order = await Order.findById(req.params.id).populate('customer','name');

    if(!order){
        res.status(500).json({success:false})
    }

    res.send(order);
})

router.post('/',async(req,res)=>{

        // create order items
        const orderItemId = await Promise.all(
            req.body.orderItems.map(async (orderItem) => {
                let newOrderItem = new OrderItem({
                    quantity: orderItem.quantity,
                    product: orderItem.product
                });

                newOrderItem = await newOrderItem.save();
                return newOrderItem._id;
            })
        );

    let order = new Order({
        orderItem:orderItemId ,
        shippingAdd1: req.body.shippingAdd1,
        shippingAdd2: req.body.shippingAdd2,
        zip: req.body.zip,
        country: req.body.country,
        city: req.body.city,
        phone: req.body.phone,
        status: req.body.status,
        totalprice:req.body.totalprice,
        customer: req.body.customer
    })

     order = await order.save();

    if(!order)
    {
        return res.status(400).send("the order cannnot be saved")
    }

    res.send(order);
})

router.put('/:id',async (req,res)=>{
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            {
                status:req.body.status
            },
            {new:true}
        )

        if(!order){
            return res.status(500).json({success:false, message:"The order cannot be updated"});
        }

        res.status(200).json({success:true, data:order});
})

router.delete('/:id', async (req, res) => {
    Order.findByIdAndRemove(req.params.id).then(async order => {
        if (order) {
            await order.orderItem.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem);
            })
            return res.status(200).json({ success: true, message: "the order is deleted!" });
        } else {
            return res.status(404).json({ success: false, message: "order not found!" });
        }
    }).catch(err => {
        return res.status(400).json({ success: false, error: err });
    })
});




module.exports = router;