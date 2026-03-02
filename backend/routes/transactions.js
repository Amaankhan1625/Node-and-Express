const { getIncome,addIncome,deleteIncome } = require('../controllers/Income');
const { getExpenses,addExpense,deleteExpense } = require('../controllers/Expense');
const router = require('express').Router();

router.get('/', (req, res) => {
  res.send('MONEY TRASACTIONS')
});

router.post('/add-income', addIncome)
      .get('/get-income',getIncome)
      .delete('/delete-income/:id',deleteIncome)
router.post('/add-expense', addExpense)
      .get('/get-expenses',getExpenses)
      .delete('/delete-expense/:id',deleteExpense)

module.exports = router;