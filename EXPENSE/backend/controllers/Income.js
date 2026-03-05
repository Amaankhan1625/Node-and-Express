const IncomeSchema = require('../models/IncomeModel');

const addIncome = async (req, res) => {
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

        //create income record in the database 
        const income = await IncomeSchema.create({
            amount,
            description,
            date
        }); 

        res.status(201).json({
            success: true,
            data: income,
            date: income.date
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
const getIncome = async (req, res) => {
    try {
        const income = await IncomeSchema.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: income
        });
    } 
    
    catch (error) {
       res.status(500).json({message : 'Server Error'});
    }
}

const deleteIncome = async (req, res) => {

    const { id } = req.params;

    IncomeSchema.findByIdAndDelete(id)
    .then(() => {
        res.status(200).json({message : 'Income record deleted successfully'});
    })
    .catch((error) => {
        console.error(error);
        res.status(500).json({message : 'Server Error'});
    });
}

module.exports = { addIncome, getIncome , deleteIncome };   