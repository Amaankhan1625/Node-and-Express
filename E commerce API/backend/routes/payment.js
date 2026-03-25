const express = require('express');
const router = express.Router();
const { Payment } = require('../model/payment');
const paymentService = require('../services/paymentService');
const mongoose = require('mongoose');

/**
 * Create a new payment
 * POST /api/v1/payments/
 */
router.post('/', async (req, res) => {
    try {
        const { customer, order, paymentMethod, amount, cardDetails, paypalEmail, bankDetails } = req.body;

        // Validate required fields
        if (!customer || !order || !paymentMethod || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Validate payment details based on method
        try {
            paymentService.validatePaymentDetails(paymentMethod, {
                cardDetails,
                paypalEmail,
                bankDetails
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        const paymentData = {
            customer,
            order,
            paymentMethod,
            amount,
            cardDetails,
            paypalEmail,
            bankDetails
        };

        const payment = await paymentService.createPayment(paymentData);

        res.status(201).json({
            success: true,
            message: 'Payment created successfully',
            payment
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

        res.status(200).json({
            success: true,
            payment
        });
    } catch (error) {
        res.status(404).json({
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

        res.status(200).json({
            success: true,
            count: payments.length,
            payments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * Get payments for a customer
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

        res.status(200).json({
            success: true,
            count: payments.length,
            payments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * Get payments for an order
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

        res.status(200).json({
            success: true,
            count: payments.length,
            payments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * Process payment
 * POST /api/v1/payments/:id/process
 */
router.post('/:id/process', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment ID'
            });
        }

        const { transactionId, status, failureReason } = req.body;

        const paymentGatewayResponse = {
            transactionId: transactionId || `TXN-${Date.now()}`,
            status: status || 'completed',
            failureReason
        };

        const payment = await paymentService.processPayment(req.params.id, paymentGatewayResponse);

        res.status(200).json({
            success: true,
            message: 'Payment processed successfully',
            payment
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

        const validStatuses = ['pending', 'processing', 'completed', 'failed', 'refunded'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment status'
            });
        }

        const payment = await paymentService.updatePaymentStatus(req.params.id, status, reason);

        res.status(200).json({
            success: true,
            message: 'Payment status updated successfully',
            payment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * Refund payment
 * POST /api/v1/payments/:id/refund
 */
router.post('/:id/refund', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment ID'
            });
        }

        const { refundAmount, refundReason } = req.body;

        if (!refundAmount || !refundReason) {
            return res.status(400).json({
                success: false,
                message: 'Refund amount and reason are required'
            });
        }

        const payment = await paymentService.refundPayment(req.params.id, refundAmount, refundReason);

        res.status(200).json({
            success: true,
            message: 'Refund processed successfully',
            payment
        });
    } catch (error) {
        res.status(500).json({
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
