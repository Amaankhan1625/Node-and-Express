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
        enum: ['cod', 'card', 'upi', 'netbanking', 'emi'],
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },

    transactionId: String,

    // For Card & EMI payments only
    cardDetails: {
        cardHolderName: String,
        cardNumber: {
            encrypted: String,
            iv: String,
            authTag: String
        },
        last4Digits: String,
        expiryMonth: String,
        expiryYear: String,
        cvv: {
            encrypted: String,
            iv: String,
            authTag: String
        }
    },

    // For UPI payments only
    upiDetails: {
        upiId: String
    },

    // For Net Banking payments only
    bankDetails: {
        bankName: String,
        accountHolderName: String
    },

    failureReason: String,

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
