const express = require('express')
const router = express.Router();
const orderService = require('../services/orderService');


router.get('/', async (req, res) => {
    try {
        const orderList = await orderService.getOrders();
        res.send(orderList);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET orders by customer
router.get('/customer/:customerId', async(req,res)=>{
    try {
        const orderList = await orderService.getOrdersByCustomerId(req.params.customerId);
        res.send(orderList);
    } catch (error) {
        const statusCode = error.message === 'Invalid customer ID' ? 400 : 500;
        res.status(statusCode).json({success:false, message: error.message})
    }
})

router.get('/:id',async (req,res)=>{
    try {
        const order = await orderService.getOrderById(req.params.id);
        res.send(order);
    } catch (error) {
        const statusCode = error.message === 'Invalid order ID'
            ? 400
            : error.message === 'Order not found'
                ? 404
                : 500;

        res.status(statusCode).json({ success: false, message: error.message });
    }
})

// POST - Create order from selected cart items
router.post('/from-cart/create', async(req,res)=>{
    try {
        const order = await orderService.createOrderFromCart(req.body);

        res.status(201).json({
            success: true,
            message: 'Order created successfully from cart',
            order
        });
    } catch (error) {
        const badRequestErrors = ['Missing required fields', 'Invalid customer ID', 'Invalid cart item ID'];
        const statusCode = badRequestErrors.includes(error.message)
            ? 400
            : error.message === 'Cart items not found'
                ? 404
                : 500;

        res.status(statusCode).json({ success: false, message: error.message });
    }
});

// POST - Create order (legacy support)
router.post('/',async(req,res)=>{
    try {
        const order = await orderService.createOrderLegacy(req.body);
        res.status(201).json({ success: true, data: order });
    } catch (error) {
        const badRequestErrors = ['Missing required fields', 'Invalid product ID'];
        const statusCode = badRequestErrors.includes(error.message) ? 400 : 500;
        res.status(statusCode).json({ success: false, message: error.message });
    }
})


router.put('/:id',async (req,res)=>{
    try {
        const order = await orderService.updateOrderStatus(req.params.id, req.body.status);

        res.status(200).json({success:true, data:order});
    } catch (error) {
        const statusCode = error.message === 'Invalid order ID' || error.message === 'Missing status'
            ? 400
            : error.message === 'Order not found'
                ? 404
                : 500;

        res.status(statusCode).json({ success: false, message: error.message });
    }
})

router.delete('/:id', async (req, res) => {
    try {
        await orderService.deleteOrder(req.params.id);
        return res.status(200).json({ success: true, message: 'the order is deleted!' });
    } catch (error) {
        const statusCode = error.message === 'Invalid order ID'
            ? 400
            : error.message === 'Order not found'
                ? 404
                : 500;

        res.status(statusCode).json({ success: false, message: error.message });
    }
});




module.exports = router;