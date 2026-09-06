const express = require('express');
const router = express.Router();
const { 
  getTransactions, 
  addTransaction, 
  updateTransaction, 
  deleteTransaction 
} = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');

// All transaction routes are protected by authMiddleware
router.use(authMiddleware);

router.get('/', getTransactions);
router.post('/', addTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;