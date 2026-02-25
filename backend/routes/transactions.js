const router = require('express').Router();

router.get('/', (req, res) => {
  res.send('MONEY TRASACTIONS')
});

module.exports = router;