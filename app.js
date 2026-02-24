const express = require('express');
const router  = express.Router();
const app = express();
const PORT = 3000;

app.use(express.json());

//In memory data store for expenses
let expenses = [];


// Create a new expense
app.post('/expenses', (req, res) => {
  const { description, amount } = req.body;
  const newExpense = {
    id: expenses.length + 1,
    description,
    amount,
    date: new Date()    
    };  
    expenses.push(newExpense);
    res.status(201).json(newExpense);
});


// Get all expenses
app.get('/expenses', (req, res) => {
  res.json(expenses);
});

//get expense by id
app.get('/expenses/:id', (req, res) => {
  const expenseId = parseInt(req.params.id);
  const expense = expenses.find(e => e.id === expenseId);
  if (expense)
  {
    res.json(expense);
  } 
  
  else 
  {
    res.status(404).json({ message: 'Expense not found' });
  } 
});

//update an expense
app.put('/expenses/:id', (req, res) => {
  const expenseId = parseInt(req.params.id);
  const { description, amount } = req.body;
  const expenseIndex = expenses.findIndex(e => e.id === expenseId);
  if (expenseIndex !== -1) {
    expenses[expenseIndex] = {
      id: expenseId,
      description,
      amount,
      date: expenses[expenseIndex].date
    };
    res.json(expenses[expenseIndex]);
  } else {
    res.status(404).json({ message: 'Expense not found' });
  } 
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
