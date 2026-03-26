const express = require('express');
const router = express.Router();
const cartService = require('../services/cartService');

// GET - Retrieve all cart items for a customer
router.get('/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;

        const cartSummary = await cartService.getCartByCustomerId(customerId);

        res.status(200).json({
            success: true,
            message: "Cart retrieved successfully",
            cart: cartSummary.cart,
            totalItems: cartSummary.totalItems,
            totalPrice: cartSummary.totalPrice
        });
    } catch (error) {
        const statusCode = error.message.includes('Invalid customer ID') ? 400 : 500;
        res.status(statusCode).json({ success: false, message: error.message });
    }
});

// POST - Add item to cart
router.post('/add', async (req, res) => {
    try {
        const cartItem = await cartService.addItemToCart(req.body);

        res.status(201).json({
            success: true,
            message: "Item added to cart successfully",
            cart: cartItem
        });
    } catch (error) {
        const badRequestErrors = ['Missing required fields', 'Invalid product ID', 'Invalid customer ID', 'Invalid quantity'];
        const statusCode = badRequestErrors.includes(error.message)
            ? 400
            : error.message === 'Product not found'
                ? 404
                : 500;

        res.status(statusCode).json({ success: false, message: error.message });
    }
});

// PUT - Update cart item quantity
router.put('/update/:cartItemId', async (req, res) => {
    try {
        const { cartItemId } = req.params;
        const { quantity } = req.body;

        const cartItem = await cartService.updateItemQuantity(cartItemId, quantity);

        res.status(200).json({
            success: true,
            message: "Cart item updated successfully",
            cart: cartItem
        });
    } catch (error) {
        const statusCode = error.message === 'Invalid quantity' || error.message === 'Invalid cart item ID'
            ? 400
            : error.message === 'Cart item not found'
                ? 404
                : 500;

        res.status(statusCode).json({ success: false, message: error.message });
    }
});

// DELETE - Remove item from cart
router.delete('/remove/:cartItemId', async (req, res) => {
    try {
        const { cartItemId } = req.params;

        await cartService.removeItem(cartItemId);

        res.status(200).json({
            success: true,
            message: "Item removed from cart successfully"
        });
    } catch (error) {
        const statusCode = error.message === 'Invalid cart item ID'
            ? 400
            : error.message === 'Cart item not found'
                ? 404
                : 500;

        res.status(statusCode).json({ success: false, message: error.message });
    }
});

// DELETE - Clear entire cart
router.delete('/clear/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;

        const deletedCount = await cartService.clearCustomerCart(customerId);

        res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            deletedCount
        });
    } catch (error) {
        const statusCode = error.message === 'Invalid customer ID' ? 400 : 500;
        res.status(statusCode).json({ success: false, message: error.message });
    }
});

module.exports = router;
