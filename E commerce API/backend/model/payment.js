const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },

    paymentMethod: {
        type: String,
        enum: ['creditCard', 'debitCard', 'paypal', 'bankTransfer', 'upi', 'wallet'],
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },

    transactionId: {
        type: String,
        unique: true,
        sparse: true
    },

    cardDetails: {
        cardHolderName: String,
        cardNumber: String, // Ideally encrypted in production
        expiryMonth: String,
        expiryYear: String,
        cvv: String // Ideally encrypted in production
    },

    paypalEmail: String,

    bankDetails: {
        accountHolderName: String,
        accountNumber: String,
        bankName: String,
        routingNumber: String,
        ifscCode: String
    },

    currency: {
        type: String,
        default: 'USD'
    },

    paymentDate: {
        type: Date,
        default: Date.now
    },

    processedDate: Date,

    failureReason: String,

    refundDetails: {
        refundAmount: Number,
        refundDate: Date,
        refundReason: String,
        refundStatus: {
            type: String,
            enum: ['pending', 'completed', 'failed']
        }
    },

    metadata: mongoose.Schema.Types.Mixed,

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
});

paymentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

exports.Payment = mongoose.model('Payment', paymentSchema);
exports.paymentSchema = paymentSchema;
