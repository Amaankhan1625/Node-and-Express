const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    dateAdded: {
        type: Date,
        default: Date.now
    }
});

cartSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

cartSchema.set('toJSON', {
    virtuals: true
});

exports.Cart = mongoose.model("Cart", cartSchema);
