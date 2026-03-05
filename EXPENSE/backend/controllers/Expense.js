const ExpenseSchema = require('../models/ExpenseModel');

const addExpense = async (req, res) => {
    const { amount, description, date } = req.body;

    try {
        //validation
        if (!amount || !description) {
            return res.status(400).json({
                success: false,
                error: 'Please provide amount and description'
            });
        }

        if (amount<= 0 || isNaN(amount)) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a valid amount'
            });
        }

        //create expanse record in the database 
        const expense = await ExpenseSchema.create({
            amount,
            description,
            date
        }); 

        res.status(201).json({
            success: true,
            data: expense,
            date: expense.date
        });
    } 
    
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
}
const getExpenses = async (req, res) => {
    try {
        const expenses = await ExpenseSchema.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: expenses
        });
    } 
    
    catch (error) {
       res.status(500).json({message : 'Server Error'});
    }
}

const deleteExpense = async (req, res) => {

    const { id } = req.params;

    ExpenseSchema.findByIdAndDelete(id)
    .then(() => {
        res.status(200).json({message : 'expense record deleted successfully'});
    })
    .catch((error) => {
        console.error(error);
        res.status(500).json({message : 'Server Error'});
    });
}

module.exports = { addExpense, getExpenses , deleteExpense };   