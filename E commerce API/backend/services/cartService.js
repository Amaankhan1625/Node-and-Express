const mongoose = require('mongoose');
const { Cart } = require('../model/cart');
const { Product } = require('../model/product');

class CartService {
    validateObjectId(id, fieldName) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error(`Invalid ${fieldName}`);
        }
    }

    async getCartByCustomerId(customerId) {
        this.validateObjectId(customerId, 'customer ID');

        const cartItems = await Cart.find({ customer: customerId })
            .populate('product')
            .populate('customer');

        let totalPrice = 0;
        const cartWithTotal = cartItems.map((item) => {
            const productPrice = item.product && item.product.price ? item.product.price : 0;
            const itemTotal = productPrice * item.quantity;
            totalPrice += itemTotal;

            return {
                ...item.toJSON(),
                itemTotal
            };
        });

        return {
            cart: cartWithTotal,
            totalItems: cartItems.length,
            totalPrice
        };
    }

    async addItemToCart({ productId, customerId, quantity }) {
        if (!productId || !customerId || !quantity) {
            throw new Error('Missing required fields');
        }

        this.validateObjectId(productId, 'product ID');
        this.validateObjectId(customerId, 'customer ID');

        const parsedQuantity = parseInt(quantity, 10);
        if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
            throw new Error('Invalid quantity');
        }

        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        let cartItem = await Cart.findOne({ product: productId, customer: customerId });

        if (cartItem) {
            cartItem.quantity += parsedQuantity;
            await cartItem.save();
        } else {
            cartItem = new Cart({
                product: productId,
                customer: customerId,
                quantity: parsedQuantity
            });
            await cartItem.save();
        }

        return cartItem;
    }

    async updateItemQuantity(cartItemId, quantity) {
        this.validateObjectId(cartItemId, 'cart item ID');

        const parsedQuantity = parseInt(quantity, 10);
        if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
            throw new Error('Invalid quantity');
        }

        const cartItem = await Cart.findByIdAndUpdate(
            cartItemId,
            { quantity: parsedQuantity },
            { new: true }
        ).populate('product');

        if (!cartItem) {
            throw new Error('Cart item not found');
        }

        return cartItem;
    }

    async removeItem(cartItemId) {
        this.validateObjectId(cartItemId, 'cart item ID');

        const cartItem = await Cart.findByIdAndDelete(cartItemId);
        if (!cartItem) {
            throw new Error('Cart item not found');
        }

        return true;
    }

    async clearCustomerCart(customerId) {
        this.validateObjectId(customerId, 'customer ID');

        const result = await Cart.deleteMany({ customer: customerId });
        return result.deletedCount;
    }
}

module.exports = new CartService();