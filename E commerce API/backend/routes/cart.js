const express = require('express');
const router = express.Router();
const { Cart } = require("../model/cart");
const { Product } = require("../model/product");
const mongoose = require("mongoose");

// GET - Retrieve all cart items for a customer
router.get('/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            return res.status(400).json({ success: false, message: "Invalid customer ID" });
        }

        const cartItems = await Cart.find({ customer: customerId })
            .populate('product')
            .populate('customer');

        if (!cartItems) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        // Calculate total price
        let totalPrice = 0;
        const cartWithTotal = cartItems.map(item => {
            const itemTotal = item.product.price * item.quantity;
            totalPrice += itemTotal;
            return {
                ...item.toJSON(),
                itemTotal
            };
        });

        res.status(200).json({
            success: true,
            message: "Cart retrieved successfully",
            cart: cartWithTotal,
            totalItems: cartItems.length,
            totalPrice: totalPrice
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST - Add item to cart
router.post('/add', async (req, res) => {
    try {
        const { productId, customerId, quantity } = req.body;

        if (!productId || !customerId || !quantity) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Check if item already in cart
        let cartItem = await Cart.findOne({ product: productId, customer: customerId });

        if (cartItem) {
            // Update quantity if already exists
            cartItem.quantity += parseInt(quantity);
            await cartItem.save();
        } else {
            // Create new cart item
            cartItem = new Cart({
                product: productId,
                customer: customerId,
                quantity: parseInt(quantity)
            });
            await cartItem.save();
        }

        res.status(201).json({
            success: true,
            message: "Item added to cart successfully",
            cart: cartItem
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT - Update cart item quantity
router.put('/update/:cartItemId', async (req, res) => {
    try {
        const { cartItemId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ success: false, message: "Invalid quantity" });
        }

        let cartItem = await Cart.findByIdAndUpdate(
            cartItemId,
            { quantity: parseInt(quantity) },
            { new: true }
        ).populate('product');

        if (!cartItem) {
            return res.status(404).json({ success: false, message: "Cart item not found" });
        }

        res.status(200).json({
            success: true,
            message: "Cart item updated successfully",
            cart: cartItem
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE - Remove item from cart
router.delete('/remove/:cartItemId', async (req, res) => {
    try {
        const { cartItemId } = req.params;

        const cartItem = await Cart.findByIdAndDelete(cartItemId);

        if (!cartItem) {
            return res.status(404).json({ success: false, message: "Cart item not found" });
        }

        res.status(200).json({
            success: true,
            message: "Item removed from cart successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE - Clear entire cart
router.delete('/clear/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;

        const result = await Cart.deleteMany({ customer: customerId });

        res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

exports.router = router;
