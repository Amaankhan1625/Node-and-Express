const mongoose = require('mongoose');
const { Order } = require('../model/order');
const { OrderItem } = require('../model/orderItem');
const { Cart } = require('../model/cart');

class OrderService {
    validateObjectId(id, fieldName) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error(`Invalid ${fieldName}`);
        }
    }

    buildOrderPopulateQuery() {
        return [
            { path: 'customer', select: 'name' },
            {
                path: 'orderItem',
                populate: {
                    path: 'product',
                    model: 'Product'
                }
            }
        ];
    }

    async getOrders() {
        return Order.find().populate(this.buildOrderPopulateQuery());
    }

    async getOrderById(orderId) {
        this.validateObjectId(orderId, 'order ID');

        const order = await Order.findById(orderId).populate(this.buildOrderPopulateQuery());
        if (!order) {
            throw new Error('Order not found');
        }

        return order;
    }

    async getOrdersByCustomerId(customerId) {
        this.validateObjectId(customerId, 'customer ID');

        return Order.find({ customer: customerId })
            .populate(this.buildOrderPopulateQuery())
            .sort({ datecreated: -1 });
    }

    async createOrderFromCart(body) {
        const { customerId, shippingAdd1, shippingAdd2, city, zip, country, phone, cartItemIds } = body;

        if (!customerId || !shippingAdd1 || !shippingAdd2 || !city || !zip || !country || !phone || !Array.isArray(cartItemIds) || cartItemIds.length === 0) {
            throw new Error('Missing required fields');
        }

        this.validateObjectId(customerId, 'customer ID');

        cartItemIds.forEach((cartItemId) => this.validateObjectId(cartItemId, 'cart item ID'));

        const cartItems = await Cart.find({ _id: { $in: cartItemIds } }).populate('product');

        if (cartItems.length === 0) {
            throw new Error('Cart items not found');
        }

        // Validate stock availability for all items before creating order
        const { Product } = require('../model/product');
        for (const cartItem of cartItems) {
            const product = await Product.findById(cartItem.product._id);
            if (!product || product.Instock < cartItem.quantity) {
                const availableStock = product ? product.Instock : 0;
                throw new Error(`Insufficient stock for product ${cartItem.product._id}. Only ${availableStock} items available`);
            }
        }

        let totalPrice = 0;
        const orderItemIds = [];

        for (const cartItem of cartItems) {
            const orderItem = new OrderItem({
                quantity: cartItem.quantity,
                product: cartItem.product._id
            });

            await orderItem.save();
            orderItemIds.push(orderItem._id);
            totalPrice += cartItem.product.price * cartItem.quantity;
        }

        let order = new Order({
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

        order = await order.save();

        if (!order) {
            throw new Error('The order cannot be saved');
        }

        // Decrement stock for each product after successful order creation
        const { Product: ProductModel } = require('../model/product');
        for (const cartItem of cartItems) {
            await ProductModel.findByIdAndUpdate(
                cartItem.product._id,
                { $inc: { Instock: -cartItem.quantity } },
                { new: true }
            );
        }

        await Cart.deleteMany({ _id: { $in: cartItemIds } });

        return order;
    }

    async createOrderLegacy(body) {
        if (!Array.isArray(body.orderItems) || body.orderItems.length === 0) {
            throw new Error('Missing required fields');
        }

        const { Product } = require('../model/product');

        // Validate stock availability for all items before creating order
        const productStockMap = new Map();
        for (const orderItem of body.orderItems) {
            if (!orderItem.product || !orderItem.quantity) {
                throw new Error('Missing required fields');
            }

            this.validateObjectId(orderItem.product, 'product ID');

            const product = await Product.findById(orderItem.product);
            if (!product || product.Instock < orderItem.quantity) {
                const availableStock = product ? product.Instock : 0;
                throw new Error(`Insufficient stock for product ${orderItem.product}. Only ${availableStock} items available`);
            }
            productStockMap.set(orderItem.product.toString(), orderItem.quantity);
        }

        const orderItemIds = await Promise.all(
            body.orderItems.map(async (orderItem) => {
                let newOrderItem = new OrderItem({
                    quantity: orderItem.quantity,
                    product: orderItem.product
                });

                newOrderItem = await newOrderItem.save();
                return newOrderItem._id;
            })
        );

        let order = new Order({
            orderItem: orderItemIds,
            shippingAdd1: body.shippingAdd1,
            shippingAdd2: body.shippingAdd2,
            zip: body.zip,
            country: body.country,
            city: body.city,
            phone: body.phone,
            status: body.status,
            totalprice: body.totalprice,
            customer: body.customer
        });

        order = await order.save();

        if (!order) {
            throw new Error('The order cannot be saved');
        }

        // Decrement stock for each product after successful order creation
        const { Product: ProductModel } = require('../model/product');
        for (const [productId, quantity] of productStockMap.entries()) {
            await ProductModel.findByIdAndUpdate(
                productId,
                { $inc: { Instock: -quantity } },
                { new: true }
            );
        }

        return order;
    }

    async updateOrderStatus(orderId, status) {
        this.validateObjectId(orderId, 'order ID');

        if (!status) {
            throw new Error('Missing status');
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );

        if (!order) {
            throw new Error('Order not found');
        }

        return order;
    }

    async deleteOrder(orderId) {
        this.validateObjectId(orderId, 'order ID');

        const order = await Order.findByIdAndDelete(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        await Promise.all(
            order.orderItem.map(async (orderItemId) => {
                await OrderItem.findByIdAndDelete(orderItemId);
            })
        );

        return true;
    }
}

module.exports = new OrderService();