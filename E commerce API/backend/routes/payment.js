const express = require('express');
const router = express.Router();
const { Payment } = require('../model/payment');
const paymentService = require('../services/paymentService');
const mongoose = require('mongoose');

/**
 * Create a new payment
 * POST /api/v1/payments/
 * Payment Methods: cod (Cash on Delivery), card, upi, netbanking, emi
 */
router.post('/', async (req, res) => {
    try {
        const { customer, order, paymentMethod, amount, cardDetails, upiDetails, bankDetails } = req.body;

        // Validate required fields
        if (!customer || !order || !paymentMethod || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: customer, order, paymentMethod, amount'
            });
        }

        // Validate payment method
        const validMethods = ['cod', 'card', 'upi', 'netbanking', 'emi'];
        if (!validMethods.includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: `Invalid payment method. Must be one of: ${validMethods.join(', ')}`
            });
        }

        const paymentData = {
            customer,
            order,
            paymentMethod,
            amount,
            cardDetails,
            upiDetails,
            bankDetails
        };

        const payment = await paymentService.createPayment(paymentData);

        // Return masked payment details for security
        const responseData = payment.toObject ? payment.toObject() : payment;
        if (payment.paymentMethod === 'card' || payment.paymentMethod === 'emi') {
            responseData.cardDetails = paymentService.getMaskedCardDetails(payment);
        }

        res.status(201).json({
            success: true,
            message: 'Payment created successfully',
            payment: responseData
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * Get all payments
 * GET /api/v1/payments/
 */
router.get('/', async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('customer', 'name email')
            .populate('order')
            .sort({ createdAt: -1 });

        const maskedPayments = payments.map(payment => {
            const data = payment.toObject();
            if (payment.paymentMethod === 'card' || payment.paymentMethod === 'emi') {
                data.cardDetails = paymentService.getMaskedCardDetails(payment);
            }
            return data;
        });

        res.status(200).json({
            success: true,
            count: maskedPayments.length,
            payments: maskedPayments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * Get payment by ID
 * GET /api/v1/payments/:id
 */
router.get('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment ID'
            });
        }

        const payment = await paymentService.getPaymentById(req.params.id);
        const responseData = payment.toObject();
        
        if (payment.paymentMethod === 'card' || payment.paymentMethod === 'emi') {
            responseData.cardDetails = paymentService.getMaskedCardDetails(payment);
        }

        res.status(200).json({
            success: true,
            payment: responseData
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * Get payments by customer
 * GET /api/v1/payments/customer/:customerId
 */
router.get('/customer/:customerId', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.customerId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid customer ID'
            });
        }

        const payments = await paymentService.getCustomerPayments(req.params.customerId);
        
        const maskedPayments = payments.map(payment => {
            const data = payment.toObject();
            if (payment.paymentMethod === 'card' || payment.paymentMethod === 'emi') {
                data.cardDetails = paymentService.getMaskedCardDetails(payment);
            }
            return data;
        });

        res.status(200).json({
            success: true,
            count: maskedPayments.length,
            payments: maskedPayments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * Get payments by order
 * GET /api/v1/payments/order/:orderId
 */
router.get('/order/:orderId', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID'
            });
        }

        const payments = await paymentService.getOrderPayments(req.params.orderId);
        
        const maskedPayments = payments.map(payment => {
            const data = payment.toObject();
            if (payment.paymentMethod === 'card' || payment.paymentMethod === 'emi') {
                data.cardDetails = paymentService.getMaskedCardDetails(payment);
            }
            return data;
        });

        res.status(200).json({
            success: true,
            count: maskedPayments.length,
            payments: maskedPayments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * Update payment status
 * PATCH /api/v1/payments/:id/status
 */
router.patch('/:id/status', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment ID'
            });
        }

        const { status, reason } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const payment = await paymentService.updatePaymentStatus(req.params.id, status, reason);

        res.status(200).json({
            success: true,
            message: 'Payment status updated successfully',
            payment
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * Get payment statistics
 * GET /api/v1/payments/stats/report
 */
router.get('/stats/report', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required'
            });
        }

        const stats = await paymentService.getPaymentStatistics(
            new Date(startDate),
            new Date(endDate)
        );

        res.status(200).json({
            success: true,
            stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
