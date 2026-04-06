const { Payment } = require('../model/payment');
const { Order } = require('../model/order');
const { Customer } = require('../model/customer');
const encryptionService = require('../helper/encryption');

class PaymentService {
    /**
     * Create a new payment record
     * Payment Methods: cod, card, upi, netbanking, emi
     */
    async createPayment(paymentData) {
        try {
            const { customer, order, paymentMethod, amount, cardDetails, upiDetails, bankDetails } = paymentData;

            // Validate order exists
            const orderRecord = await Order.findById(order);
            if (!orderRecord) {
                throw new Error('Order not found');
            }

            // Validate customer exists
            const customerRecord = await Customer.findById(customer);
            if (!customerRecord) {
                throw new Error('Customer not found');
            }

            // Skip payment creation for COD (Cash on Delivery)
            if (paymentMethod === 'cod') {
                return {
                    customer,
                    order,
                    paymentMethod: 'cod',
                    amount,
                    status: 'pending',
                    _id: null
                };
            }

            // Validate and process payment details based on method
            let processedData = {};

            if (paymentMethod === 'card' || paymentMethod === 'emi') {
                if (!cardDetails) {
                    throw new Error('Card details required for card/EMI payments');
                }
                this.validateCardDetails(cardDetails);
                processedData.cardDetails = {
                    cardHolderName: cardDetails.cardHolderName,
                    cardNumber: encryptionService.encrypt(cardDetails.cardNumber),
                    last4Digits: String(cardDetails.cardNumber).slice(-4),
                    expiryMonth: cardDetails.expiryMonth,
                    expiryYear: cardDetails.expiryYear,
                    cvv: encryptionService.encrypt(cardDetails.cvv)
                };
            }

            if (paymentMethod === 'upi') {
                if (!upiDetails?.upiId) {
                    throw new Error('UPI ID required for UPI payments');
                }
                this.validateUpiDetails(upiDetails.upiId);
                processedData.upiDetails = { upiId: upiDetails.upiId };
            }

            if (paymentMethod === 'netbanking') {
                if (!bankDetails) {
                    throw new Error('Bank details required for net banking payments');
                }
                this.validateBankDetails(bankDetails);
                processedData.bankDetails = {
                    bankName: bankDetails.bankName,
                    accountHolderName: bankDetails.accountHolderName
                };
            }

            const payment = new Payment({
                customer,
                order,
                paymentMethod,
                amount,
                transactionId: this.generateTransactionId(),
                status: 'pending',
                ...processedData
            });

            await payment.save();
            return payment;
        } catch (error) {
            throw new Error(`Payment creation failed: ${error.message}`);
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
            return await Payment.find({ customer: customerId })
                .populate('order')
                .sort({ createdAt: -1 });
        } catch (error) {
            throw new Error(`Failed to fetch customer payments: ${error.message}`);
        }
    }

    /**
     * Get all payments for an order
     */
    async getOrderPayments(orderId) {
        try {
            return await Payment.find({ order: orderId })
                .populate('customer', 'name email');
        } catch (error) {
            throw new Error(`Failed to fetch order payments: ${error.message}`);
        }
    }

    /**
     * Update payment status
     */
    async updatePaymentStatus(paymentId, status, reason = null) {
        try {
            if (!['pending', 'completed', 'failed', 'refunded'].includes(status)) {
                throw new Error('Invalid payment status');
            }

            const payment = await Payment.findByIdAndUpdate(
                paymentId,
                {
                    status,
                    ...(reason && { failureReason: reason })
                },
                { new: true }
            );

            if (!payment) {
                throw new Error('Payment not found');
            }

            // Update order status when payment is completed
            if (status === 'completed') {
                await Order.findByIdAndUpdate(payment.order, { status: 'confirmed' });
            }

            return payment;
        } catch (error) {
            throw new Error(`Failed to update payment status: ${error.message}`);
        }
    }

    /**
     * Get masked card details for display (never expose full card or CVV)
     */
    getMaskedCardDetails(payment) {
        if (!payment.cardDetails || !['card', 'emi'].includes(payment.paymentMethod)) {
            return null;
        }

        return {
            cardHolderName: payment.cardDetails.cardHolderName,
            last4Digits: payment.cardDetails.last4Digits,
            expiryMonth: payment.cardDetails.expiryMonth,
            expiryYear: payment.cardDetails.expiryYear
        };
    }

    /**
     * Validate card details
     */
    validateCardDetails(details) {
        if (!details.cardHolderName || !details.cardNumber || !details.expiryMonth || !details.expiryYear || !details.cvv) {
            throw new Error('Invalid card details: missing required fields');
        }

        if (!this.isValidCardNumber(details.cardNumber)) {
            throw new Error('Invalid card number');
        }

        return true;
    }

    /**
     * Validate UPI ID
     */
    validateUpiDetails(upiId) {
        const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/;
        if (!upiRegex.test(upiId)) {
            throw new Error('Invalid UPI ID format');
        }
        return true;
    }

    /**
     * Validate bank details
     */
    validateBankDetails(details) {
        if (!details.bankName || !details.accountHolderName) {
            throw new Error('Invalid bank details: missing required fields');
        }
        return true;
    }

    /**
     * Validate card number using Luhn algorithm
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
     * Generate transaction ID
     */
    generateTransactionId() {
        return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }

    /**
     * Get payment statistics
     */
    async getPaymentStatistics(startDate, endDate) {
        try {
            return await Payment.aggregate([
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
        } catch (error) {
            throw new Error(`Failed to fetch payment statistics: ${error.message}`);
        }
    }
}

module.exports = new PaymentService();
