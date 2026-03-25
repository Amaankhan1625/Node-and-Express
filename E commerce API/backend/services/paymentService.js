const { Payment } = require('../model/payment');
const { Order } = require('../model/order');
const { Customer } = require('../model/customer');

class PaymentService {
    /**
     * Create a new payment record
     */
    async createPayment(paymentData) {
        try {
            // Validate order exists
            const order = await Order.findById(paymentData.order);
            if (!order) {
                throw new Error('Order not found');
            }

            // Validate customer exists
            const customer = await Customer.findById(paymentData.customer);
            if (!customer) {
                throw new Error('Customer not found');
            }

            // Generate transaction ID
            const transactionId = this.generateTransactionId();

            const newPayment = new Payment({
                ...paymentData,
                transactionId,
                status: 'pending'
            });

            await newPayment.save();
            return newPayment;
        } catch (error) {
            throw new Error(`Payment creation failed: ${error.message}`);
        }
    }

    /**
     * Process payment
     */
    async processPayment(paymentId, paymentGatewayResponse) {
        try {
            const payment = await Payment.findById(paymentId);
            if (!payment) {
                throw new Error('Payment not found');
            }

            // Update payment status based on gateway response
            payment.status = paymentGatewayResponse.status || 'processing';
            payment.processedDate = new Date();

            if (paymentGatewayResponse.status === 'completed') {
                payment.transactionId = paymentGatewayResponse.transactionId;
                
                // Update order status
                const order = await Order.findById(payment.order);
                if (order) {
                    order.status = 'confirmed';
                    await order.save();
                }
            } else if (paymentGatewayResponse.status === 'failed') {
                payment.failureReason = paymentGatewayResponse.failureReason || 'Payment processing failed';
            }

            await payment.save();
            return payment;
        } catch (error) {
            throw new Error(`Payment processing failed: ${error.message}`);
        }
    }

    /**
     * Get payment by ID
     */
    async getPaymentById(paymentId) {
        try {
            const payment = await Payment.findById(paymentId)
                .populate('customer', 'name email')
                .populate('order');
            
            if (!payment) {
                throw new Error('Payment not found');
            }

            return payment;
        } catch (error) {
            throw new Error(`Failed to fetch payment: ${error.message}`);
        }
    }

    /**
     * Get all payments for a customer
     */
    async getCustomerPayments(customerId) {
        try {
            const payments = await Payment.find({ customer: customerId })
                .populate('order')
                .sort({ createdAt: -1 });

            return payments;
        } catch (error) {
            throw new Error(`Failed to fetch customer payments: ${error.message}`);
        }
    }

    /**
     * Get all payments for an order
     */
    async getOrderPayments(orderId) {
        try {
            const payments = await Payment.find({ order: orderId })
                .populate('customer', 'name email');

            return payments;
        } catch (error) {
            throw new Error(`Failed to fetch order payments: ${error.message}`);
        }
    }

    /**
     * Update payment status
     */
    async updatePaymentStatus(paymentId, status, reason = null) {
        try {
            const payment = await Payment.findById(paymentId);
            if (!payment) {
                throw new Error('Payment not found');
            }

            payment.status = status;
            if (reason) {
                payment.failureReason = reason;
            }

            await payment.save();
            return payment;
        } catch (error) {
            throw new Error(`Failed to update payment status: ${error.message}`);
        }
    }

    /**
     * Refund payment
     */
    async refundPayment(paymentId, refundAmount, refundReason) {
        try {
            const payment = await Payment.findById(paymentId);
            if (!payment) {
                throw new Error('Payment not found');
            }

            if (payment.status !== 'completed') {
                throw new Error('Only completed payments can be refunded');
            }

            if (refundAmount > payment.amount) {
                throw new Error('Refund amount cannot exceed payment amount');
            }

            payment.refundDetails = {
                refundAmount,
                refundDate: new Date(),
                refundReason,
                refundStatus: 'pending'
            };

            payment.status = 'refunded';
            await payment.save();

            return payment;
        } catch (error) {
            throw new Error(`Refund failed: ${error.message}`);
        }
    }

    /**
     * Validate payment details based on method
     */
    validatePaymentDetails(paymentMethod, details) {
        const validators = {
            creditCard: (data) => this.validateCardDetails(data),
            debitCard: (data) => this.validateCardDetails(data),
            paypal: (data) => this.validatePaypalDetails(data),
            bankTransfer: (data) => this.validateBankDetails(data),
            upi: (data) => this.validateUpiDetails(data),
            wallet: (data) => true
        };

        const validator = validators[paymentMethod];
        if (!validator) {
            throw new Error('Invalid payment method');
        }

        return validator(details);
    }

    /**
     * Validate card details
     */
    validateCardDetails(details) {
        if (!details.cardHolderName || !details.cardNumber || !details.expiryMonth || !details.expiryYear || !details.cvv) {
            throw new Error('Invalid card details');
        }

        // Basic card number validation (Luhn algorithm)
        if (!this.isValidCardNumber(details.cardNumber)) {
            throw new Error('Invalid card number');
        }

        return true;
    }

    /**
     * Validate PayPal details
     */
    validatePaypalDetails(details) {
        if (!details.paypalEmail || !this.isValidEmail(details.paypalEmail)) {
            throw new Error('Invalid PayPal email');
        }

        return true;
    }

    /**
     * Validate bank details
     */
    validateBankDetails(details) {
        if (!details.accountHolderName || !details.accountNumber || !details.bankName) {
            throw new Error('Invalid bank details');
        }

        return true;
    }

    /**
     * Validate UPI details
     */
    validateUpiDetails(details) {
        if (!details.upiId || !this.isValidUpi(details.upiId)) {
            throw new Error('Invalid UPI ID');
        }

        return true;
    }

    /**
     * Helper: Validate Luhn algorithm for card number
     */
    isValidCardNumber(cardNumber) {
        const cleaned = cardNumber.replace(/\s/g, '');
        if (!/^\d{13,19}$/.test(cleaned)) return false;

        let sum = 0;
        let isEven = false;

        for (let i = cleaned.length - 1; i >= 0; i--) {
            let digit = parseInt(cleaned[i], 10);

            if (isEven) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }

            sum += digit;
            isEven = !isEven;
        }

        return sum % 10 === 0;
    }

    /**
     * Helper: Validate email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Helper: Validate UPI ID
     */
    isValidUpi(upiId) {
        const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/;
        return upiRegex.test(upiId);
    }

    /**
     * Helper: Generate unique transaction ID
     */
    generateTransactionId() {
        return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }

    /**
     * Get payment statistics
     */
    async getPaymentStatistics(startDate, endDate) {
        try {
            const stats = await Payment.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate, $lte: endDate },
                        status: 'completed'
                    }
                },
                {
                    $group: {
                        _id: '$paymentMethod',
                        totalAmount: { $sum: '$amount' },
                        count: { $sum: 1 },
                        averageAmount: { $avg: '$amount' }
                    }
                },
                { $sort: { totalAmount: -1 } }
            ]);

            return stats;
        } catch (error) {
            throw new Error(`Failed to fetch payment statistics: ${error.message}`);
        }
    }
}

module.exports = new PaymentService();
