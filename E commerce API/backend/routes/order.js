const express = require('express')
const router = express.Router();
const {Order}= require("../model/order");
const {OrderItem}= require("../model/orderItem");
const { Cart } = require("../model/cart");
const mongoose = require("mongoose");


router.get('/', async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/:id',async (req,res)=>{
    try {
        const order = await Order.findById(req.params.id)
            .populate('customer','name')
            .populate({
                path: 'orderItem',
                populate: {
                    path: 'product',
                    model: 'Product'
                }
            });

        if(!order){
            return res.status(500).json({success:false})
        }

        res.send(order);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
})

// GET orders by customer
router.get('/customer/:customerId', async(req,res)=>{
    try {
        const orderList = await Order.find({customer: req.params.customerId})
            .populate('customer','name')
            .populate({
                path:'orderItem',
                populate:{path : 'product'}})
            .sort({'dateCreated':-1});
        
        if(!orderList) {
            return res.status(500).json({success:false})
        }
        res.send(orderList);
    } catch (error) {
        res.status(500).json({success:false, message: error.message})
    }
})

// POST - Create order from selected cart items
router.post('/from-cart/create', async(req,res)=>{
    try {
        const { customerId, shippingAdd1, shippingAdd2, city, zip, country, phone, cartItemIds } = req.body;

        if (!customerId || !shippingAdd1 || !shippingAdd2 || !city || !zip || !country || !phone || !cartItemIds || cartItemIds.length === 0) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Get cart items
        const cartItems = await Cart.find({ _id: { $in: cartItemIds } }).populate('product');

        if (cartItems.length === 0) {
            return res.status(404).json({ success: false, message: "Cart items not found" });
        }

        // Create OrderItems and calculate total
        let totalPrice = 0;
        let orderItemIds = [];

        for (const cartItem of cartItems) {
            const orderItem = new OrderItem({
                quantity: cartItem.quantity,
                product: cartItem.product._id
            });
            await orderItem.save();
            orderItemIds.push(orderItem._id);
            totalPrice += (cartItem.product.price * cartItem.quantity);
        }

        // Create order
        const order = new Order({
            orderItem: orderItemIds,
            shippingAdd1,
            shippingAdd2,
            city,
            zip,
            country,
            phone,
            status: 'pending',
            totalprice: totalPrice,
            customer: customerId
        });

        await order.save();

        // Remove ordered items from cart
        await Cart.deleteMany({ _id: { $in: cartItemIds } });

        res.status(201).json({
            success: true,
            message: "Order created successfully from cart",
            order: order
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST - Create order (legacy support)
router.post('/',async(req,res)=>{
    try {
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
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
})


router.put('/:id',async (req,res)=>{
    try {
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
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (order) {
            await Promise.all(order.orderItem.map(async orderItem => {
                await OrderItem.findByIdAndDelete(orderItem);
            }))
            return res.status(200).json({ success: true, message: "the order is deleted!" });
        } else {
            return res.status(404).json({ success: false, message: "order not found!" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});




module.exports = router;