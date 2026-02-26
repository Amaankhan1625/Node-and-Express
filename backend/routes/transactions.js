const addIncome = require('../controllers/Income').addIncome;

const router = require('express').Router();

router.get('/', (req, res) => {
  res.send('MONEY TRASACTIONS')
});

router.post('/add-income', addIncome);

module.exports = router;