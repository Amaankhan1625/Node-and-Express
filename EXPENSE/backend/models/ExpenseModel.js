const mongoose = require('mongoose');  

const ExpenseSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: [true, 'Please add a amount']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        trim : true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
} ,
{timestamps : true});

module.exports = mongoose.model('Expense', ExpenseSchema);
